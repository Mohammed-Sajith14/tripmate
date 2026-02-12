import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createTrip,
  getAllTrips,
  getOrganizerTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  publishTrip,
} from '../controllers/trip.controller.js';

const router = express.Router();

// Public routes
router.get('/', getAllTrips);
router.get('/:tripId', getTripById);

// Protected routes
router.post('/', protect, createTrip);
router.get('/organizer/my-trips', protect, getOrganizerTrips);
router.patch('/:tripId', protect, updateTrip);
router.delete('/:tripId', protect, deleteTrip);
router.patch('/:tripId/publish', protect, publishTrip);

export default router;
