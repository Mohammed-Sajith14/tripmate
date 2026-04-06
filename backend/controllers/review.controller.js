import Booking from '../models/Booking.model.js';
import Review from '../models/Review.model.js';
import Trip from '../models/Trip.model.js';

const sanitizeText = (value = '') => String(value || '').trim();

const parseRating = (value) => Number(value);

const buildPagination = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

const buildSummary = (reviews = []) => {
  if (!reviews.length) {
    return {
      totalReviews: 0,
      averageOrganizerRating: 0,
    };
  }

  const totalOrganizer = reviews.reduce((acc, review) => {
    return acc + (review.organizerReview?.rating || 0);
  }, 0);

  return {
    totalReviews: reviews.length,
    averageOrganizerRating: Number((totalOrganizer / reviews.length).toFixed(2)),
  };
};

export const createTripReview = async (req, res) => {
  try {
    const { tripId } = req.params;
    const reviewerId = req.user?._id;

    const organizerRating = parseRating(req.body?.organizerReview?.rating);
    const organizerText = sanitizeText(req.body?.organizerReview?.text);

    if (!reviewerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized request' });
    }

    if (req.user?.role !== 'traveler') {
      return res.status(403).json({
        success: false,
        message: 'Only travelers can submit trip reviews',
      });
    }

    const hasInvalidRating = !Number.isFinite(organizerRating) || organizerRating < 1 || organizerRating > 5;
    if (hasInvalidRating) {
      return res.status(400).json({
        success: false,
        message: 'Organizer rating must be a number between 1 and 5',
      });
    }

    if (!organizerText) {
      return res.status(400).json({
        success: false,
        message: 'Organizer review text is required',
      });
    }

    const trip = await Trip.findById(tripId).populate('organizer', 'fullName organizationName');
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (!trip.endDate || new Date(trip.endDate) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Review can be submitted only after trip completion date',
      });
    }

    const booking = await Booking.findOne({
      trip: trip._id,
      traveler: reviewerId,
      status: 'confirmed',
    });

    if (!booking) {
      return res.status(403).json({
        success: false,
        message: 'Only confirmed travelers of this trip can submit reviews',
      });
    }

    const existing = await Review.findOne({ trip: trip._id, reviewer: reviewerId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this trip',
      });
    }

    const organizerNameSnapshot =
      trip.organizer?.organizationName || trip.organizer?.fullName || 'Organizer';

    const review = await Review.create({
      trip: trip._id,
      booking: booking._id,
      organizer: trip.organizer?._id || trip.organizer,
      reviewer: reviewerId,
      organizerNameSnapshot,
      reviewerUserIdSnapshot: req.user?.userId || '',
      reviewerNameSnapshot: req.user?.fullName || '',
      organizerReview: {
        rating: organizerRating,
        text: organizerText,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (error) {
    console.error('Create trip review error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error submitting review',
      error: error.message,
    });
  }
};

export const getOrganizerReviews = async (req, res) => {
  try {
    const { organizerId } = req.params;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ organizer: organizerId })
        .populate('trip', 'title destination country endDate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ organizer: organizerId }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        summary: buildSummary(reviews),
        pagination: buildPagination({ page, limit, total }),
      },
    });
  } catch (error) {
    console.error('Get organizer reviews error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching organizer reviews',
      error: error.message,
    });
  }
};

export const getMyOrganizerReviews = async (req, res) => {
  req.params.organizerId = String(req.user?._id || '');
  return getOrganizerReviews(req, res);
};
