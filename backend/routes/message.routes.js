import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getConversations,
  getConversation,
  startConversation,
  startTripInquiry,
  sendMessage,
  markAsRead,
  deleteConversation
} from '../controllers/message.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all conversations
router.get('/', getConversations);

// Get specific conversation with messages
router.get('/:conversationId', getConversation);

// Start new or get existing direct conversation
router.post('/start', startConversation);

// Start trip inquiry conversation
router.post('/inquiry/start', startTripInquiry);

// Send message (REST fallback)
router.post('/:conversationId/send', sendMessage);

// Mark conversation as read
router.patch('/:conversationId/read', markAsRead);

// Delete conversation
router.delete('/:conversationId', deleteConversation);

export default router;
