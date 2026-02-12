import mongoose from 'mongoose';

const followSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure a user can't follow the same person twice
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Index for efficient queries
followSchema.index({ follower: 1 });
followSchema.index({ following: 1 });

const Follow = mongoose.model('Follow', followSchema);

export default Follow;
