import Trip from '../models/Trip.model.js';
import Booking from '../models/Booking.model.js';

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';

const fetchLocationSuggestions = async (query, limit = 6) => {
  if (!query || typeof query !== 'string') {
    return [];
  }

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: String(limit),
    addressdetails: '0',
  });

  const response = await fetch(`${NOMINATIM_SEARCH_URL}?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'TripMate/1.0 (trip-location-geocoder)',
    },
  });

  if (!response.ok) {
    return [];
  }

  const results = await response.json();
  if (!Array.isArray(results) || results.length === 0) {
    return [];
  }

  return results
    .map((item) => ({
      name: typeof item?.display_name === 'string' ? item.display_name : '',
      latitude: Number(item?.lat),
      longitude: Number(item?.lon),
    }))
    .filter(
      (item) =>
        item.name &&
        Number.isFinite(item.latitude) &&
        Number.isFinite(item.longitude)
    );
};

const geocodeTripLocation = async (query) => {
  if (!query || typeof query !== 'string') {
    return null;
  }

  try {
    const suggestions = await fetchLocationSuggestions(query, 1);
    if (suggestions.length === 0) {
      return null;
    }

    return {
      latitude: suggestions[0].latitude,
      longitude: suggestions[0].longitude,
    };
  } catch (error) {
    console.error('Location geocoding error:', error);
    return null;
  }
};

export const suggestTripLocations = async (req, res) => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    if (query.length < 2) {
      return res.status(200).json({
        success: true,
        data: {
          locations: [],
        },
      });
    }

    const suggestions = await fetchLocationSuggestions(query, 6);

    res.status(200).json({
      success: true,
      data: {
        locations: suggestions,
      },
    });
  } catch (error) {
    console.error('Suggest trip locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching location suggestions',
      error: error.message,
    });
  }
};

// Create a new trip
export const createTrip = async (req, res) => {
  try {
    const { title, destination, country, location, category, startDate, endDate, priceMin, priceMax, totalSpots, bookingDeadline, coverImage, galleryImages, description, itinerary, inclusions, exclusions, cancellationPolicy, refundPolicy, minimumGroupSize, requirements, importantNotes } = req.body;
    const organizerId = req.user._id;
    const normalizedLocation = typeof location === 'string' ? location.trim() : '';

    const cleanedGalleryImages = Array.isArray(galleryImages)
      ? galleryImages.filter((image) => typeof image === 'string' && image.trim() !== '')
      : [];

    const cleanedItinerary = Array.isArray(itinerary)
      ? itinerary
          .map((item, index) => ({
            day: Number(item?.day) || index + 1,
            title: typeof item?.title === 'string' ? item.title.trim() : '',
            description: typeof item?.description === 'string' ? item.description.trim() : '',
          }))
          .filter((item) => item.title || item.description)
      : [];

    const cleanedInclusions = Array.isArray(inclusions)
      ? inclusions
          .filter((item) => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    const cleanedExclusions = Array.isArray(exclusions)
      ? exclusions
          .filter((item) => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    // Validate required fields
    if (!title || !destination || !country || !normalizedLocation || !category || !startDate || !endDate || !priceMin || !priceMax || !totalSpots || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
        missing: {
          title: !title,
          destination: !destination,
          country: !country,
          location: !normalizedLocation,
          category: !category,
          startDate: !startDate,
          endDate: !endDate,
          priceMin: !priceMin,
          priceMax: !priceMax,
          totalSpots: !totalSpots,
          description: !description,
        }
      });
    }

    const geocodedLocation = await geocodeTripLocation(
      [normalizedLocation, destination, country].filter(Boolean).join(', ')
    );

    if (!geocodedLocation) {
      return res.status(400).json({
        success: false,
        message: 'Unable to map this location. Please provide a more specific location.',
      });
    }

    // Validate prices
    if (priceMin > priceMax) {
      return res.status(400).json({
        success: false,
        message: 'Minimum price cannot be greater than maximum price',
      });
    }

    const trip = await Trip.create({
      title: title.trim(),
      destination: destination.trim(),
      country: country.trim(),
      location: {
        name: normalizedLocation,
        latitude: geocodedLocation.latitude,
        longitude: geocodedLocation.longitude,
      },
      category,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      priceMin,
      priceMax,
      totalSpots,
      availableSpots: totalSpots,
      bookingDeadline: bookingDeadline ? new Date(bookingDeadline) : null,
      organizer: organizerId,
      coverImage: typeof coverImage === 'string' && coverImage.trim() !== '' ? coverImage.trim() : undefined,
      galleryImages: cleanedGalleryImages,
      description: description.trim(),
      itinerary: cleanedItinerary,
      inclusions: cleanedInclusions,
      exclusions: cleanedExclusions,
      cancellationPolicy: typeof cancellationPolicy === 'string' && cancellationPolicy.trim() !== '' ? cancellationPolicy.trim() : undefined,
      refundPolicy: typeof refundPolicy === 'string' && refundPolicy.trim() !== '' ? refundPolicy.trim() : undefined,
      minimumGroupSize,
      requirements: typeof requirements === 'string' && requirements.trim() !== '' ? requirements.trim() : undefined,
      importantNotes: typeof importantNotes === 'string' && importantNotes.trim() !== '' ? importantNotes.trim() : undefined,
      isPublished: true,
      isDraft: false,
    });

    // Populate organizer info
    await trip.populate('organizer', 'userId fullName profilePicture role organizationName');

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: trip,
    });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating trip',
      error: error.message,
    });
  }
};

// Get all published trips
export const getAllTrips = async (req, res) => {
  try {
    const {
      category,
      destination,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      summary = 'true',
    } = req.query;
    const parsedPage = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (parsedPage - 1) * parsedLimit;
    const isSummaryMode = String(summary).toLowerCase() !== 'false';

    // Build filter
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (destination) filter.destination = { $regex: destination, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.priceMin = {};
      if (minPrice) filter.priceMin.$lte = parseInt(minPrice);
      if (maxPrice) filter.priceMin.$gte = parseInt(maxPrice);
    }

    const query = Trip.find(filter)
      .populate('organizer', 'userId fullName profilePicture role organizationName')
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .skip(skip)
      .lean();

    if (isSummaryMode) {
      query.select(
        'title destination country category startDate endDate priceMin priceMax availableSpots totalSpots coverImage location organizer createdAt'
      );
    }

    const trips = await query;

    const total = await Trip.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        trips,
        pagination: {
          currentPage: parsedPage,
          totalPages: Math.ceil(total / parsedLimit),
          totalTrips: total,
          hasMore: skip + trips.length < total,
        },
      },
    });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trips',
      error: error.message,
    });
  }
};

// Get trips by organizer
export const getOrganizerTrips = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const trips = await Trip.find({ organizer: organizerId })
      .populate('organizer', 'userId fullName profilePicture role organizationName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Trip.countDocuments({ organizer: organizerId });

    res.status(200).json({
      success: true,
      data: {
        trips,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalTrips: total,
          hasMore: skip + trips.length < total,
        },
      },
    });
  } catch (error) {
    console.error('Get organizer trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trips',
      error: error.message,
    });
  }
};

// Get single trip
export const getTripById = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId).populate('organizer', 'userId fullName profilePicture role organizationName');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trip',
      error: error.message,
    });
  }
};

// Update trip
export const updateTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const organizerId = req.user._id;

    let trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    // Check authorization
    if (trip.organizer.toString() !== organizerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own trips',
      });
    }

    const updatePayload = { ...req.body };

    if (typeof updatePayload.location === 'string') {
      const normalizedLocation = updatePayload.location.trim();

      if (!normalizedLocation) {
        return res.status(400).json({
          success: false,
          message: 'Location cannot be empty',
        });
      }

      const locationCountry =
        typeof updatePayload.country === 'string' && updatePayload.country.trim() !== ''
          ? updatePayload.country.trim()
          : trip.country;

      const locationDestination =
        typeof updatePayload.destination === 'string' && updatePayload.destination.trim() !== ''
          ? updatePayload.destination.trim()
          : trip.destination;

      const geocodedLocation = await geocodeTripLocation(
        [normalizedLocation, locationDestination, locationCountry].filter(Boolean).join(', ')
      );

      if (!geocodedLocation) {
        return res.status(400).json({
          success: false,
          message: 'Unable to map this location. Please provide a more specific location.',
        });
      }

      updatePayload.location = {
        name: normalizedLocation,
        latitude: geocodedLocation.latitude,
        longitude: geocodedLocation.longitude,
      };
    }

    // Update fields
    trip = await Trip.findByIdAndUpdate(tripId, updatePayload, {
      new: true,
      runValidators: true,
    }).populate('organizer', 'userId fullName profilePicture role organizationName');

    res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      data: trip,
    });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating trip',
      error: error.message,
    });
  }
};

// Delete trip
export const deleteTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const organizerId = req.user._id;

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    // Check authorization
    if (trip.organizer.toString() !== organizerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own trips',
      });
    }

    await Trip.findByIdAndDelete(tripId);

    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully',
    });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting trip',
      error: error.message,
    });
  }
};

// Publish trip (convert from draft to published)
export const publishTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const organizerId = req.user._id;

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    // Check authorization
    if (trip.organizer.toString() !== organizerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only publish your own trips',
      });
    }

    trip.isPublished = true;
    trip.isDraft = false;
    await trip.save();

    await trip.populate('organizer', 'userId fullName profilePicture role organizationName');

    res.status(200).json({
      success: true,
      message: 'Trip published successfully',
      data: trip,
    });
  } catch (error) {
    console.error('Publish trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error publishing trip',
      error: error.message,
    });
  }
};

// Book a trip (traveler only)
export const bookTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const travelerId = req.user._id;

    if (req.user.role !== 'traveler') {
      return res.status(403).json({
        success: false,
        message: 'Only travelers can book trips',
      });
    }

    const trip = await Trip.findById(tripId).populate('organizer', 'userId fullName');

    if (!trip || !trip.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    if (trip.organizer._id.toString() === travelerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book your own trip',
      });
    }

    if (trip.bookingDeadline && new Date() > new Date(trip.bookingDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Booking deadline has passed for this trip',
      });
    }

    if (trip.availableSpots <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No spots available for this trip',
      });
    }

    const existingBooking = await Booking.findOne({
      trip: trip._id,
      traveler: travelerId,
      status: 'confirmed',
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You have already booked this trip',
      });
    }

    const booking = await Booking.create({
      trip: trip._id,
      traveler: travelerId,
      organizer: trip.organizer._id,
      status: 'confirmed',
      priceAtBooking: trip.priceMin,
    });

    trip.availableSpots = Math.max(0, trip.availableSpots - 1);
    trip.bookings.push(booking._id);
    await trip.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('trip', 'title destination startDate endDate coverImage')
      .populate('traveler', 'userId fullName profilePicture role')
      .populate('organizer', 'userId fullName profilePicture role organizationName');

    res.status(201).json({
      success: true,
      message: 'Trip booked successfully',
      data: {
        booking: populatedBooking,
        trip: {
          _id: trip._id,
          availableSpots: trip.availableSpots,
          totalSpots: trip.totalSpots,
        },
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already booked this trip',
      });
    }

    console.error('Book trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error booking trip',
      error: error.message,
    });
  }
};

// Get current traveler's bookings
export const getMyBookings = async (req, res) => {
  try {
    const travelerId = req.user._id;

    const bookings = await Booking.find({ traveler: travelerId, status: 'confirmed' })
      .populate({
        path: 'trip',
        select: 'title destination country startDate endDate coverImage priceMin priceMax availableSpots totalSpots organizer',
        populate: {
          path: 'organizer',
          select: 'userId fullName profilePicture role organizationName',
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        bookings,
      },
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message,
    });
  }
};
