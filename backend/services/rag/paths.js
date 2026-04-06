import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const BACKEND_ROOT = path.resolve(__dirname, '../..');
export const RAG_ROOT = path.join(BACKEND_ROOT, 'rag');
export const RAG_INDEX_DIR = path.join(RAG_ROOT, 'index');

export const TRIP_DOCUMENTS_PATH = path.join(RAG_INDEX_DIR, 'trip_documents.json');
export const FAISS_INDEX_PATH = path.join(RAG_INDEX_DIR, 'trip_index.faiss');
export const FAISS_METADATA_PATH = path.join(RAG_INDEX_DIR, 'trip_metadata.json');

export const BUILD_INDEX_SCRIPT_PATH = path.join(RAG_ROOT, 'build_faiss_index.py');
export const RETRIEVE_SCRIPT_PATH = path.join(RAG_ROOT, 'retrieve_trips.py');
export const RETRIEVAL_SERVER_SCRIPT_PATH = path.join(RAG_ROOT, 'retrieval_server.py');
