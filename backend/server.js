import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Socket.IO initialization
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Atlas Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Atlas Connection Failed:', error);
    process.exit(1);
  }
};

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'TripMate API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/auth/google/callback', (req, res) => {
  res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
});

// Import routes (will be added feature by feature)
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import followRoutes from './routes/follow.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import postRoutes from './routes/post.routes.js';
import tripRoutes from './routes/trip.routes.js';
import messageRoutes from './routes/message.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';
import reviewRoutes from './routes/review.routes.js';
import { initRagRetriever, stopRagRetriever } from './services/rag/retriever.service.js';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/reviews', reviewRoutes);

// Socket.IO Event Handlers
import Message from './models/Message.model.js';
import Conversation from './models/Conversation.model.js';
import User from './models/User.model.js';

// Store active users
const activeUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join user room
  socket.on('user_connected', (userId) => {
    socket.data.userIdentifier = userId;
    activeUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Join conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
  });

  // Leave conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(`Socket ${socket.id} left conversation: ${conversationId}`);
  });

  // Send message event
  socket.on('send_message', async (data, callback) => {
    try {
      const {
        conversationId: rawConversationId,
        senderId: rawSenderId,
        senderUserId: rawSenderUserId,
        content,
        clientMessageId
      } = data || {};

      const resolveSenderId = async (value) => {
        if (!value) {
          return null;
        }

        let candidate = value;

        if (typeof candidate === 'object') {
          candidate = candidate?._id || candidate?.id || candidate?.userId;
        }

        if (!candidate) {
          return null;
        }

        if (mongoose.Types.ObjectId.isValid(candidate)) {
          return candidate.toString();
        }

        const senderUser = await User.findOne({
          userId: String(candidate).toLowerCase()
        }).select('_id');

        return senderUser?._id?.toString() || null;
      };

      const normalizedConversationId =
        rawConversationId ||
        data?.conversation?._id ||
        data?.conversation?.id ||
        null;

      let normalizedSenderId = await resolveSenderId(rawSenderId);

      if (!normalizedSenderId) {
        normalizedSenderId = await resolveSenderId(rawSenderUserId);
      }

      if (!normalizedSenderId) {
        normalizedSenderId = await resolveSenderId(socket.data?.userIdentifier);
      }

      const missingFields = [];

      if (!normalizedConversationId) {
        missingFields.push('conversationId');
      }

      if (!normalizedSenderId) {
        missingFields.push('senderId');
      }

      if (!content?.trim()) {
        missingFields.push('content');
      }

      if (missingFields.length > 0) {
        const payload = {
          message: 'Invalid message payload',
          missingFields
        };
        socket.emit('error', payload);
        if (typeof callback === 'function') {
          callback({ success: false, ...payload });
        }
        return;
      }

      const conversation = await Conversation.findById(normalizedConversationId).select('participants unreadCount');
      if (!conversation) {
        const payload = { message: 'Conversation not found' };
        socket.emit('error', payload);
        if (typeof callback === 'function') {
          callback({ success: false, ...payload });
        }
        return;
      }

      const isParticipant = conversation.participants.some(
        (participantId) => participantId.toString() === normalizedSenderId.toString()
      );

      if (!isParticipant) {
        const payload = { message: 'Not authorized to send in this conversation' };
        socket.emit('error', payload);
        if (typeof callback === 'function') {
          callback({ success: false, ...payload });
        }
        return;
      }

      // Create message in database
      const message = new Message({
        conversation: normalizedConversationId,
        sender: normalizedSenderId,
        content: content.trim(),
        isRead: false
      });

      await message.save();

      // Populate sender data
      const populatedMessage = await message.populate('sender', 'userId fullName profilePicture');

      // Update conversation's last message
      await Conversation.findByIdAndUpdate(
        normalizedConversationId,
        {
          lastMessage: {
            content: content.trim(),
            sender: normalizedSenderId,
            timestamp: new Date()
          }
        }
      );

      if (conversation) {
        const unreadCount = conversation.unreadCount || new Map();

        conversation.participants.forEach((participantId) => {
          const participantKey = participantId.toString();
          if (participantKey === normalizedSenderId.toString()) {
            unreadCount.set(participantKey, 0);
          } else {
            const currentUnread = unreadCount.get(participantKey) || 0;
            unreadCount.set(participantKey, currentUnread + 1);
          }
        });

        await Conversation.findByIdAndUpdate(normalizedConversationId, { unreadCount });
      }

      const payload = {
        id: message._id,
        conversationId: normalizedConversationId,
        content: content.trim(),
        sender: populatedMessage.sender,
        senderId: normalizedSenderId,
        timestamp: message.createdAt,
        isRead: false,
        clientMessageId: clientMessageId || null
      };

      // Broadcast to conversation room
      io.to(`conversation:${normalizedConversationId}`).emit('message_received', payload);

      // Also push to each participant's personal room for realtime inbox updates
      conversation.participants.forEach((participantId) => {
        io.to(`user:${participantId.toString()}`).emit('message_received', payload);
      });

      if (typeof callback === 'function') {
        callback({ success: true, payload });
      }

      console.log(`Message sent in conversation: ${normalizedConversationId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      const payload = { message: 'Failed to send message' };
      socket.emit('error', payload);
      if (typeof callback === 'function') {
        callback({ success: false, ...payload });
      }
    }
  });

  // Mark message as read
  socket.on('mark_as_read', async (data) => {
    try {
      const { messageId, conversationId } = data;

      await Message.findByIdAndUpdate(
        messageId,
        { isRead: true, readAt: new Date() }
      );

      io.to(`conversation:${conversationId}`).emit('message_read', { messageId, conversationId });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  // Typing indicator
  socket.on('user_typing', (data) => {
    const { conversationId, userId } = data;
    socket.to(`conversation:${conversationId}`).emit('user_typing', { userId });
  });

  socket.on('user_stopped_typing', (data) => {
    const { conversationId, userId } = data;
    socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', { userId });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Remove from active users
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        break;
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
// Start server
const PORT = process.env.PORT || 5000;

const shutdown = () => {
  try {
    stopRagRetriever();
  } catch (error) {
    console.error('Shutdown cleanup error:', error.message);
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const bootstrap = async () => {
  try {
    await connectToMongoDB();

    // Skip RAG warmup in production (Railway)
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.time('[startup] rag-retriever-init');
        await initRagRetriever();
        console.timeEnd('[startup] rag-retriever-init');
      } catch (error) {
        console.error('[startup] RAG retriever warmup failed:', error.message);
      }
    } else {
      console.log('⚡ Production mode: skipping RAG warmup');
    }

    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 API ready`);
      console.log(`💬 WebSocket ready`);
    });
  } catch (error) {
    console.error('❌ Server bootstrap failed:', error);
    process.exit(1);
  }
};

bootstrap();
