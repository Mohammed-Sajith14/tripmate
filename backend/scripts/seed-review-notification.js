import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Notification from '../models/Notification.model.js';
import Trip from '../models/Trip.model.js';
import User from '../models/User.model.js';

dotenv.config();

const findTraveler = async () => User.findOne({ userId: 'sajith14' }).lean();

const findOrganizer = async () => {
  const organizerAliases = ['smilrytrips', 'smilytrips', 'smileytrips'];
  return User.findOne({ userId: { $in: organizerAliases } }).lean();
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in environment variables.');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Atlas Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Atlas Connection Failed:', error);
    throw error;
  }

  try {
    const [traveler, organizer] = await Promise.all([findTraveler(), findOrganizer()]);

    if (!traveler) {
      throw new Error('Traveler user "sajith14" not found.');
    }

    if (!organizer) {
      throw new Error('Organizer not found for aliases: smilrytrips/smilytrips/smileytrips');
    }

    const trip = await Trip.findOne({ organizer: organizer._id }).sort({ createdAt: -1 }).lean();

    if (!trip) {
      throw new Error(`No trip found for organizer ${organizer.userId}.`);
    }

    const existing = await Notification.findOne({
      recipient: traveler._id,
      sender: organizer._id,
      type: 'review',
      relatedId: trip._id,
      isRead: false,
    }).lean();

    if (existing) {
      console.log('Seed review notification already exists; no new notification created.');
      return;
    }

    const title = trip.title || 'your trip';

    const notification = await Notification.create({
      recipient: traveler._id,
      sender: organizer._id,
      type: 'review',
      message: `Your trip "${title}" is complete. Please rate and review the organizer.`,
      relatedId: trip._id,
      isRead: false,
    });

    console.log('Seed review notification created successfully.');
    console.log({
      notificationId: String(notification._id),
      traveler: traveler.userId,
      organizer: organizer.userId,
      tripId: String(trip._id),
      tripTitle: title,
    });
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

run().catch((error) => {
  console.error('Failed to seed review notification:', error.message);
  process.exit(1);
});
