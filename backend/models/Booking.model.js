import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    traveler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
    priceAtBooking: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      required: true,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ trip: 1, traveler: 1 }, { unique: true });
bookingSchema.index({ traveler: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
