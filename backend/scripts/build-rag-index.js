import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { buildTripRagIndex } from '../services/rag/indexBuilder.js';

dotenv.config();

const run = async () => {
  try {
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

    const summary = await buildTripRagIndex();

    console.log('RAG index build completed successfully.');
    console.log(summary);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Failed to build RAG index:', error.message);

    try {
      await mongoose.disconnect();
    } catch {
      // no-op
    }

    process.exit(1);
  }
};

run();
