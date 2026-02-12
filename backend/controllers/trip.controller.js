import Trip from '../models/Trip.model.js';

// Create a new trip
export const createTrip = async (req, res) => {
  try {
    const { title, destination, country, category, difficulty, startDate, endDate, priceMin, priceMax, totalSpots, bookingDeadline, coverImage, galleryImages, description, itinerary, inclusions, exclusions, cancellationPolicy, refundPolicy, minimumGroupSize, requirements, importantNotes } = req.body;
    const organizerId = req.user._id;

    // Validate required fields
    if (!title || !destination || !country || !category || !startDate || !endDate || !priceMin || !priceMax || !totalSpots || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
        missing: {
          title: !title,
          destination: !destination,
          country: !country,
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
      category,
      difficulty,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      priceMin,
      priceMax,
      totalSpots,
      availableSpots: totalSpots,
      bookingDeadline: bookingDeadline ? new Date(bookingDeadline) : null,
      organizer: organizerId,
      coverImage,
      galleryImages: galleryImages || [],
      description: description.trim(),
      itinerary: itinerary || [],
      inclusions: inclusions || [],
      exclusions: exclusions || [],
      cancellationPolicy,
      refundPolicy,
      minimumGroupSize,
      requirements,
      importantNotes,
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
    const { category, destination, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (destination) filter.destination = { $regex: destination, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.priceMin = {};
      if (minPrice) filter.priceMin.$lte = parseInt(minPrice);
      if (maxPrice) filter.priceMin.$gte = parseInt(maxPrice);
    }

    const trips = await Trip.find(filter)
      .populate('organizer', 'userId fullName profilePicture role organizationName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Trip.countDocuments(filter);

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

    // Update fields
    trip = await Trip.findByIdAndUpdate(tripId, req.body, {
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
