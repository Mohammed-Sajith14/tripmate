import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const LOCAL_MONGO_URI =
  process.env.LOCAL_MONGO_URI ||
  process.env.MONGODB_LOCAL_URI ||
  'mongodb://127.0.0.1:27017/tripmate';

const ATLAS_MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.MIGRATION_DB_NAME || 'tripmate';
const BATCH_SIZE = Number(process.env.MIGRATION_BATCH_SIZE) || 500;

const toIndexSpec = (indexDefinition) => {
  const { key, ...rest } = indexDefinition;

  delete rest.v;
  delete rest.ns;
  delete rest.background;

  return { key, ...rest };
};

const copyCollection = async ({ sourceDb, targetDb, name }) => {
  const sourceCollection = sourceDb.collection(name);
  const targetCollection = targetDb.collection(name);

  const sourceCount = await sourceCollection.countDocuments();

  await targetCollection.deleteMany({});

  let copied = 0;
  let batch = [];

  const cursor = sourceCollection.find({});
  for await (const doc of cursor) {
    batch.push(doc);

    if (batch.length >= BATCH_SIZE) {
      await targetCollection.insertMany(batch, { ordered: false });
      copied += batch.length;
      batch = [];
    }
  }

  if (batch.length > 0) {
    await targetCollection.insertMany(batch, { ordered: false });
    copied += batch.length;
  }

  const sourceIndexes = await sourceCollection.indexes();
  const targetIndexes = await targetCollection.indexes().catch(() => []);

  const hasExtraTargetIndexes = targetIndexes.some((index) => index.name !== '_id_');
  if (hasExtraTargetIndexes) {
    await targetCollection.dropIndexes();
  }

  const recreatableIndexes = sourceIndexes
    .filter((index) => index.name !== '_id_')
    .map(toIndexSpec);

  if (recreatableIndexes.length > 0) {
    await targetCollection.createIndexes(recreatableIndexes);
  }

  const targetCount = await targetCollection.countDocuments();

  if (sourceCount !== targetCount || copied !== sourceCount) {
    throw new Error(
      `Count mismatch for ${name}: source=${sourceCount}, copied=${copied}, target=${targetCount}`
    );
  }

  return {
    collection: name,
    sourceCount,
    targetCount,
    indexesCopied: recreatableIndexes.length,
  };
};

const run = async () => {
  if (!ATLAS_MONGO_URI) {
    throw new Error('MONGO_URI is missing in .env.');
  }

  console.log('Starting migration from local MongoDB to MongoDB Atlas...');
  console.log(`Source: ${LOCAL_MONGO_URI}`);
  console.log(`Target: ${ATLAS_MONGO_URI}`);
  console.log(`Database: ${DB_NAME}`);

  const sourceConnection = await mongoose.createConnection(LOCAL_MONGO_URI).asPromise();
  const targetConnection = await mongoose.createConnection(ATLAS_MONGO_URI).asPromise();

  try {
    const sourceDb = sourceConnection.useDb(DB_NAME).db;
    const targetDb = targetConnection.useDb(DB_NAME).db;

    const collectionInfo = await sourceDb.listCollections({}, { nameOnly: true }).toArray();
    const collectionNames = collectionInfo
      .map((item) => item.name)
      .filter((name) => !name.startsWith('system.'));

    if (collectionNames.length === 0) {
      throw new Error(`No collections found in local database "${DB_NAME}".`);
    }

    const results = [];

    for (const collectionName of collectionNames) {
      console.log(`Migrating collection: ${collectionName}`);
      const result = await copyCollection({
        sourceDb,
        targetDb,
        name: collectionName,
      });
      results.push(result);
      console.log(
        `Completed ${collectionName}: ${result.sourceCount} docs, ${result.indexesCopied} secondary indexes`
      );
    }

    const totalSource = results.reduce((sum, item) => sum + item.sourceCount, 0);
    const totalTarget = results.reduce((sum, item) => sum + item.targetCount, 0);

    console.log('----------------------------------------');
    console.log('Migration completed successfully.');
    console.log(`Collections migrated: ${results.length}`);
    console.log(`Total documents copied: ${totalTarget}`);

    if (totalSource !== totalTarget) {
      throw new Error(`Global count mismatch: source=${totalSource}, target=${totalTarget}`);
    }

    console.table(results);
  } finally {
    await sourceConnection.close();
    await targetConnection.close();
  }
};

run().catch((error) => {
  console.error('Migration failed:', error.message);
  process.exit(1);
});
