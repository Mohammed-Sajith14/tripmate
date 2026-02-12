import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { searchUsers, getUserProfile } from '../controllers/user.controller.js';

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// Search users
router.get('/search', searchUsers);

// Get user profile by userId
router.get('/:userId', getUserProfile);

export default router;
