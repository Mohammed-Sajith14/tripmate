import fs from 'fs/promises';

import Trip from '../../models/Trip.model.js';
import '../../models/User.model.js';
import { runPythonScript } from './pythonRunner.js';
import { buildTripDocuments } from './tripDocumentBuilder.js';
import {
  BUILD_INDEX_SCRIPT_PATH,
  FAISS_INDEX_PATH,
  FAISS_METADATA_PATH,
  RAG_INDEX_DIR,
  TRIP_DOCUMENTS_PATH,
} from './paths.js';

const ensureIndexDirectory = async () => {
  await fs.mkdir(RAG_INDEX_DIR, { recursive: true });
};

const fetchTripsForKnowledgeBase = async () => {
  const organizerFields = 'fullName userId organizationName';

  const publishedTrips = await Trip.find({ isPublished: true })
    .populate('organizer', organizerFields)
    .lean();

  if (publishedTrips.length > 0) {
    return publishedTrips;
  }

  return Trip.find({})
    .populate('organizer', organizerFields)
    .lean();
};

export const buildTripRagIndex = async () => {
  const trips = await fetchTripsForKnowledgeBase();

  if (!trips.length) {
    throw new Error('No trips found in database to build the RAG index.');
  }

  const documents = buildTripDocuments(trips);
  await ensureIndexDirectory();

  await fs.writeFile(TRIP_DOCUMENTS_PATH, JSON.stringify(documents, null, 2), 'utf-8');

  await runPythonScript(BUILD_INDEX_SCRIPT_PATH, [
    '--input',
    TRIP_DOCUMENTS_PATH,
    '--index',
    FAISS_INDEX_PATH,
    '--metadata',
    FAISS_METADATA_PATH,
  ]);

  return {
    tripsIndexed: documents.length,
    documentsPath: TRIP_DOCUMENTS_PATH,
    indexPath: FAISS_INDEX_PATH,
    metadataPath: FAISS_METADATA_PATH,
  };
};
