import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const localUri = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/tripmate';
const atlasUri = process.env.MONGO_URI;

const run = async () => {
  if (!atlasUri) {
    throw new Error('MONGO_URI is missing in .env');
  }

  const localConn = await mongoose.createConnection(localUri).asPromise();
  const atlasConn = await mongoose.createConnection(atlasUri).asPromise();

  try {
    const localDb = localConn.useDb('tripmate').db;
    const atlasDb = atlasConn.useDb('tripmate').db;

    const [
      localTrips,
      atlasTrips,
      localTripsWithCoords,
      atlasTripsWithCoords,
      localPublishedTrips,
      atlasPublishedTrips,
      atlasTripsMissingCoords,
    ] = await Promise.all([
      localDb.collection('trips').countDocuments(),
      atlasDb.collection('trips').countDocuments(),
      localDb.collection('trips').countDocuments({
        'location.latitude': { $type: 'number' },
        'location.longitude': { $type: 'number' },
      }),
      atlasDb.collection('trips').countDocuments({
        'location.latitude': { $type: 'number' },
        'location.longitude': { $type: 'number' },
      }),
      localDb.collection('trips').countDocuments({ isPublished: true }),
      atlasDb.collection('trips').countDocuments({ isPublished: true }),
      atlasDb
        .collection('trips')
        .find(
          {
            $or: [
              { 'location.latitude': { $exists: false } },
              { 'location.longitude': { $exists: false } },
              { 'location.latitude': null },
              { 'location.longitude': null },
            ],
          },
          { projection: { title: 1, destination: 1, location: 1 } }
        )
        .toArray(),
    ]);

    const localSample = await localDb
      .collection('trips')
      .find({}, { projection: { title: 1, destination: 1, location: 1, isPublished: 1 } })
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    const atlasSample = await atlasDb
      .collection('trips')
      .find({}, { projection: { title: 1, destination: 1, location: 1, isPublished: 1 } })
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    const report = {
      localTrips,
      atlasTrips,
      localTripsWithCoords,
      atlasTripsWithCoords,
      localPublishedTrips,
      atlasPublishedTrips,
      localSample,
      atlasSample,
      atlasTripsMissingCoords,
      matches:
        localTrips === atlasTrips &&
        localTripsWithCoords === atlasTripsWithCoords &&
        localPublishedTrips === atlasPublishedTrips,
    };

    console.log(JSON.stringify(report, null, 2));
  } finally {
    await localConn.close();
    await atlasConn.close();
  }
};

run().catch((error) => {
  console.error('Verification failed:', error.message);
  process.exit(1);
});
