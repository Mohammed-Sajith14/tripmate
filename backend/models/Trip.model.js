import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    // Basic Info
    title: {
      type: String,
      required: [true, 'Trip title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Adventure', 'Beach', 'Cultural', 'Mountain', 'Urban', 'Nature', 'Other', 'Hills', 'Wildlife', 'City Break', 'Road Trip', 'Cruise', 'Wellness', 'Food & Culture'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Moderate', 'Difficult', 'Challenging', 'Extreme'],
      default: 'Easy',
    },

    // Dates
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },

    // Pricing & Capacity
    priceMin: {
      type: Number,
      required: [true, 'Minimum price is required'],
      min: [0, 'Price cannot be negative'],
    },
    priceMax: {
      type: Number,
      required: [true, 'Maximum price is required'],
      min: [0, 'Price cannot be negative'],
    },
    totalSpots: {
      type: Number,
      required: [true, 'Total spots is required'],
      min: [1, 'Must have at least 1 spot'],
    },
    availableSpots: {
      type: Number,
      required: true,
    },
    bookingDeadline: Date,

    // Organizer Info
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Media
    coverImage: {
      type: String, // URL or base64
      default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600',
    },
    galleryImages: [
      {
        type: String, // URLs or base64
      },
    ],

    // Description
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },

    // Itinerary
    itinerary: [
      {
        day: Number,
        title: String,
        description: String,
      },
    ],

    // Inclusions & Exclusions
    inclusions: [String],
    exclusions: [String],

    // Policies
    cancellationPolicy: String,
    refundPolicy: String,
    minimumGroupSize: {
      type: Number,
      default: 1,
    },
    requirements: String,
    importantNotes: String,

    // Bookings
    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
      },
    ],

    // Status
    isPublished: {
      type: Boolean,
      default: false,
    },
    isDraft: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
tripSchema.index({ organizer: 1, createdAt: -1 });
tripSchema.index({ destination: 1 });
tripSchema.index({ category: 1 });
tripSchema.index({ isPublished: 1 });

export default mongoose.model('Trip', tripSchema);
