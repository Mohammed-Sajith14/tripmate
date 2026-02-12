import express from 'express';
import {
  register,
  login,
  checkUserId,
  getMe,
  updateProfile,
  changePassword
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/check-userid/:userId', checkUserId);

// Protected routes (require authentication)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
