import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Trip from '../models/Trip.model.js';

dotenv.config();

const replacements = [
  {
    title: 'Manali Mountain Reset',
    coverImage:
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    title: 'Kutch White Desert Road Trip',
    coverImage:
      'https://images.pexels.com/photos/1001435/pexels-photo-1001435.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    title: 'Andaman Island Escape',
    coverImage:
      'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
];

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in environment');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Atlas Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Atlas Connection Failed:', error);
    throw error;
  }

  try {
    for (const item of replacements) {
      const result = await Trip.updateMany(
        { title: item.title },
        { coverImage: item.coverImage }
      );

      console.log(
        `${item.title} => matched: ${result.matchedCount}, updated: ${result.modifiedCount}`
      );
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

run().catch((error) => {
  console.error('❌ Failed to update trip images:', error.message);
  process.exit(1);
});
