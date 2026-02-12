import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
} from '../controllers/follow.controller.js';

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// Follow/unfollow a user
router.post('/:userId/follow', followUser);
router.delete('/:userId/unfollow', unfollowUser);

// Get followers/following list
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);

// Check follow status
router.get('/:userId/status', checkFollowStatus);

export default router;
