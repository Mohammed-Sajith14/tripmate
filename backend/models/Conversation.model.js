import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    // Conversation participants
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],

    // Trip context (optional - for trip-related conversations)
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null
    },

    // Conversation type
    type: {
      type: String,
      enum: ['direct', 'trip_inquiry'], // direct: between followed users, trip_inquiry: traveler asking organizer
      required: true
    },

    // Last message for preview
    lastMessage: {
      content: String,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: Date
    },

    // Unread count per user
    unreadCount: {
      type: Map,
      of: Number,
      default: {}
    },

    // Active status
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt
  }
);

// Index for efficient querying
conversationSchema.index({ participants: 1 });
conversationSchema.index({ 'lastMessage.timestamp': -1 });
conversationSchema.index({ 'participants': 1, 'lastMessage.timestamp': -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
