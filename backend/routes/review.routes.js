import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import {
  createTripReview,
  getMyOrganizerReviews,
  getOrganizerReviews,
} from '../controllers/review.controller.js';

const router = express.Router();

router.get('/organizers/me', protect, restrictTo('organizer'), getMyOrganizerReviews);
router.get('/organizers/:organizerId', getOrganizerReviews);

router.post('/trips/:tripId', protect, createTripReview);

export default router;