import mongoose from 'mongoose';

const ratingSectionSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1200, 'Review text cannot exceed 1200 characters'],
    },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizerNameSnapshot: {
      type: String,
      trim: true,
      default: '',
    },
    reviewerUserIdSnapshot: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    reviewerNameSnapshot: {
      type: String,
      trim: true,
      default: '',
    },
    organizerReview: {
      type: ratingSectionSchema,
      required: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ trip: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ organizer: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);