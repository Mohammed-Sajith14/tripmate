import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createPost,
  getFeed,
  getUserPosts,
  likePost,
  unlikePost,
  addComment,
  getComments,
  deletePost,
} from '../controllers/post.controller.js';

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// Post CRUD
router.post('/', createPost);
router.get('/feed', getFeed);
router.get('/user/:userId', getUserPosts);
router.delete('/:postId', deletePost);

// Likes
router.post('/:postId/like', likePost);
router.delete('/:postId/unlike', unlikePost);

// Comments
router.post('/:postId/comments', addComment);
router.get('/:postId/comments', getComments);

export default router;
