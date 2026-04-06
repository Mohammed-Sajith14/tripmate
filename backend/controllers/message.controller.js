import Message from '../models/Message.model.js';
import Conversation from '../models/Conversation.model.js';
import User from '../models/User.model.js';
import Trip from '../models/Trip.model.js';
import mongoose from 'mongoose';

// Get all conversations for current user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    })
      .populate('participants', 'userId fullName profilePicture role')
      .populate('trip', 'title destination coverImage')
      .populate('lastMessage.sender', 'userId fullName profilePicture')
      .sort({ 'lastMessage.timestamp': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Conversation.countDocuments({
      participants: userId,
      isActive: true
    });

    // Format conversations to include other participant info
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== userId.toString()
      );
      return {
        ...conv,
        otherParticipant,
        unreadCount: conv.unreadCount?.get(userId.toString()) || 0
      };
    });

    res.status(200).json({
      success: true,
      data: {
        conversations: formattedConversations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          total,
          hasMore: skip + conversations.length < total
        }
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
};

// Get conversation by ID with messages
export const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verify user is participant
    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'userId fullName profilePicture role')
      .populate('trip', 'title destination coverImage');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conversation.participants.some(
      p => p._id.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this conversation'
      });
    }

    // Get messages
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'userId fullName profilePicture role')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Mark messages as read for current user
    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: userId }, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    // Update unread count
    const newUnreadCount = conversation.unreadCount || new Map();
    newUnreadCount.set(userId.toString(), 0);
    await Conversation.findByIdAndUpdate(conversationId, { unreadCount: newUnreadCount });

    const otherParticipant = conversation.participants.find(
      p => p._id.toString() !== userId.toString()
    );

    res.status(200).json({
      success: true,
      data: {
        conversation: {
          _id: conversation._id,
          participants: conversation.participants,
          otherParticipant,
          type: conversation.type,
          trip: conversation.trip,
          messages,
          totalMessages: await Message.countDocuments({ conversation: conversationId })
        }
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation',
      error: error.message
    });
  }
};

// Start or get conversation between two users
export const startConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId, receiverId, tripId = null, type = 'direct' } = req.body;
    const targetUserId = otherUserId || receiverId;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Other user ID is required'
      });
    }

    let otherUserObjectId = null;

    if (typeof targetUserId === 'string') {
      if (mongoose.Types.ObjectId.isValid(targetUserId)) {
        otherUserObjectId = targetUserId;
      } else {
        const user = await User.findOne({ userId: targetUserId.toLowerCase() }).select('_id');
        otherUserObjectId = user?._id || null;
      }
    } else if (targetUserId?._id) {
      otherUserObjectId = targetUserId._id;
    } else {
      otherUserObjectId = targetUserId;
    }

    if (!otherUserObjectId) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (otherUserObjectId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot start a conversation with yourself'
      });
    }

    const targetUser = await User.findById(otherUserObjectId).select('_id isActive');

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!targetUser.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This account is deactivated'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserObjectId] },
      type: type,
      ...(tripId && { trip: tripId })
    });

    if (conversation) {
      // Update lastMessage and activate
      conversation.isActive = true;
      await conversation.save();

      const populated = await conversation.populate([
        { path: 'participants', select: 'userId fullName profilePicture role' },
        { path: 'trip', select: 'title destination coverImage' },
        { path: 'lastMessage.sender', select: 'userId fullName profilePicture' }
      ]);

      return res.status(200).json({
        success: true,
        data: { conversation: populated },
        isNewConversation: false
      });
    }

    // Create new conversation
    conversation = new Conversation({
      participants: [userId, otherUserObjectId],
      trip: tripId || null,
      type: type,
      isActive: true,
      unreadCount: new Map([[userId.toString(), 0], [otherUserObjectId.toString(), 0]])
    });

    await conversation.save();

    const populated = await conversation.populate([
      { path: 'participants', select: 'userId fullName profilePicture role' },
      { path: 'trip', select: 'title destination coverImage' }
    ]);

    res.status(201).json({
      success: true,
      data: { conversation: populated },
      isNewConversation: true
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating conversation',
      error: error.message
    });
  }
};

// Start trip inquiry conversation (traveler to organizer)
export const startTripInquiry = async (req, res) => {
  try {
    const userId = req.user._id;
    const { tripId, initialMessage } = req.body;

    if (!tripId) {
      return res.status(400).json({
        success: false,
        message: 'Trip ID is required'
      });
    }

    // Get trip and verify it exists
    const trip = await Trip.findById(tripId).select('organizer');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    if (trip.organizer.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot start inquiry with yourself'
      });
    }

    // Check if inquiry conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, trip.organizer] },
      type: 'trip_inquiry',
      trip: tripId
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, trip.organizer],
        trip: tripId,
        type: 'trip_inquiry',
        isActive: true,
        unreadCount: new Map([[userId.toString(), 0], [trip.organizer.toString(), 1]])
      });

      await conversation.save();
    }

    // Create initial message if provided
    if (initialMessage) {
      const message = new Message({
        conversation: conversation._id,
        sender: userId,
        content: initialMessage,
        isRead: false
      });

      await message.save();

      // Update last message
      conversation.lastMessage = {
        content: initialMessage,
        sender: userId,
        timestamp: new Date()
      };

      await conversation.save();
    }

    const populated = await conversation.populate([
      { path: 'participants', select: 'userId fullName profilePicture role' },
      { path: 'trip', select: 'title destination coverImage' },
      { path: 'lastMessage.sender', select: 'userId fullName profilePicture' }
    ]);

    res.status(201).json({
      success: true,
      data: { conversation: populated },
      message: 'Trip inquiry conversation started'
    });
  } catch (error) {
    console.error('Start trip inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting trip inquiry',
      error: error.message
    });
  }
};

// Send message (REST endpoint for backup)
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId: bodyConversationId, content } = req.body;
    const conversationId = req.params.conversationId || bodyConversationId;

    if (!conversationId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID and content are required'
      });
    }

    // Verify user is participant
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this conversation'
      });
    }

    // Create message
    const message = new Message({
      conversation: conversationId,
      sender: userId,
      content: content.trim(),
      isRead: false
    });

    await message.save();

    const populated = await message.populate('sender', 'userId fullName profilePicture role');

    // Update last message in conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        content: content.trim(),
        sender: userId,
        timestamp: new Date()
      }
    });

    res.status(201).json({
      success: true,
      data: { message: populated }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    // Verify user is participant
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Mark all unread messages as read
    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: userId }, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    // Update unread count
    const unreadCount = conversation.unreadCount || new Map();
    unreadCount.set(userId.toString(), 0);
    await Conversation.findByIdAndUpdate(conversationId, { unreadCount });

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read',
      error: error.message
    });
  }
};

// Delete conversation
export const deleteConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this conversation'
      });
    }

    // Soft delete - mark as inactive
    await Conversation.findByIdAndUpdate(conversationId, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Conversation deleted'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting conversation',
      error: error.message
    });
  }
};
