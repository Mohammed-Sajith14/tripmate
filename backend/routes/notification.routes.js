import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from '../controllers/notification.controller.js';

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// Get notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark notification as read
router.patch('/:notificationId/read', markAsRead);

// Mark all as read
router.patch('/read-all', markAllAsRead);

// Delete notification
router.delete('/:notificationId', deleteNotification);

export default router;
