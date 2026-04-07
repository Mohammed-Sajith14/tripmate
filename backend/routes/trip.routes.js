import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createTrip,
  getAllTrips,
  suggestTripLocations,
  getOrganizerTrips,
  getTripById,
  bookTrip,
  cancelTripBooking,
  getMyBookings,
  updateTrip,
  deleteTrip,
  publishTrip,
} from '../controllers/trip.controller.js';

const router = express.Router();

// Public routes
router.get('/', getAllTrips);
router.get('/locations/suggest', suggestTripLocations);

// Protected routes
router.post('/', protect, createTrip);
router.get('/organizer/my-trips', protect, getOrganizerTrips);
router.get('/bookings/me', protect, getMyBookings);
router.post('/:tripId/book', protect, bookTrip);
router.delete('/:tripId/book', protect, cancelTripBooking);
router.patch('/:tripId', protect, updateTrip);
router.delete('/:tripId', protect, deleteTrip);
router.patch('/:tripId/publish', protect, publishTrip);

// Public route with dynamic parameter should be last
router.get('/:tripId', getTripById);

export default router;
