import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Review from '../models/Review.model.js';
import Trip from '../models/Trip.model.js';
import User from '../models/User.model.js';

dotenv.config();

const ensureEnvironment = () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set in environment variables.');
  }
};

const run = async () => {
  ensureEnvironment();

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Atlas Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Atlas Connection Failed:', error);
    throw error;
  }

  try {
    const traveler = await User.findOne({ userId: 'sajith14' }).lean();
    if (!traveler) {
      throw new Error('Traveler userId "sajith14" not found.');
    }

    const organizerCandidates = ['smileytrips', 'smilytrips', 'tripfactory'];
    const organizers = await User.find({ userId: { $in: organizerCandidates } }).lean();

    const smilyOrganizer =
      organizers.find((user) => user.userId === 'smileytrips') ||
      organizers.find((user) => user.userId === 'smilytrips');
    const tripFactoryOrganizer = organizers.find((user) => user.userId === 'tripfactory');

    const targets = [
      {
        key: smilyOrganizer?.userId || 'smilytrips',
        organizer: smilyOrganizer,
        rating: 4,
        text: 'Well coordinated trip with clear communication and smooth logistics throughout.',
      },
      {
        key: 'tripfactory',
        organizer: tripFactoryOrganizer,
        rating: 5,
        text: 'Excellent organizer support, timely updates, and a very professionally managed experience.',
      },
    ];

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const target of targets) {
      if (!target.organizer) {
        console.log(`⚠️ Organizer not found for ${target.key}, skipping.`);
        skipped += 1;
        continue;
      }

      const trip = await Trip.findOne({ organizer: target.organizer._id }).sort({ createdAt: -1 }).lean();
      if (!trip) {
        console.log(`⚠️ No trip found for organizer ${target.organizer.userId}, skipping.`);
        skipped += 1;
        continue;
      }

      const organizerNameSnapshot =
        target.organizer.organizationName || target.organizer.fullName || target.organizer.userId;

      const existing = await Review.findOne({
        trip: trip._id,
        reviewer: traveler._id,
      });

      if (existing) {
        existing.organizer = target.organizer._id;
        existing.organizerNameSnapshot = organizerNameSnapshot;
        existing.reviewerUserIdSnapshot = traveler.userId;
        existing.reviewerNameSnapshot = traveler.fullName || traveler.userId;
        existing.organizerReview = {
          rating: target.rating,
          text: target.text,
        };
        await existing.save();
        console.log(`♻️ Updated review for organizer ${target.organizer.userId} on trip ${trip.title}`);
        updated += 1;
        continue;
      }

      await Review.create({
        trip: trip._id,
        booking: null,
        organizer: target.organizer._id,
        reviewer: traveler._id,
        organizerNameSnapshot,
        reviewerUserIdSnapshot: traveler.userId,
        reviewerNameSnapshot: traveler.fullName || traveler.userId,
        organizerReview: {
          rating: target.rating,
          text: target.text,
        },
      });

      console.log(`✅ Created review for organizer ${target.organizer.userId} on trip ${trip.title}`);
      created += 1;
    }

    console.log('----------------------------------------');
    console.log(`🎉 Seed complete. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

run().catch((error) => {
  console.error('❌ Failed to seed organizer reviews:', error.message);
  process.exit(1);
});
