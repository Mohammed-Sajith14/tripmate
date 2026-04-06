import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    // Conversation reference
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },

    // Message content
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
      trim: true
    },

    // Message status
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    },

    // Attachments (optional)
    attachments: [
      {
        type: String,
        url: String
      }
    ]
  },
  {
    timestamps: true // Adds createdAt and updatedAt
  }
);

// Index for efficient querying
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
