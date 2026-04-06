import fs from 'fs/promises';
import { spawn } from 'child_process';
import fsSync from 'fs';

import {
  FAISS_INDEX_PATH,
  FAISS_METADATA_PATH,
  RETRIEVAL_SERVER_SCRIPT_PATH,
} from './paths.js';

const DEFAULT_RETRIEVE_TIMEOUT_MS = Number(process.env.RAG_RETRIEVE_TIMEOUT_MS) || 8000;
const COMMAND_TOKEN_REGEX = /(?:[^\s"']+|"[^"]*"|'[^']*')+/g;

let retrievalWorker = null;
let retrievalWorkerReadyPromise = null;
let retrievalBuffer = '';
let requestSequence = 0;
const pendingRequests = new Map();

const parseCommandTokens = (value = '') => {
  const matches = value.match(COMMAND_TOKEN_REGEX) || [];
  return matches.map((token) => token.replace(/^['"]|['"]$/g, ''));
};

const resolvePythonCommand = (rawValue) => {
  const candidate = (rawValue || '').trim();

  if (!candidate) {
    return { executable: 'python', executableArgs: [] };
  }

  if (fsSync.existsSync(candidate)) {
    return { executable: candidate, executableArgs: [] };
  }

  const tokens = parseCommandTokens(candidate);
  if (!tokens.length) {
    return { executable: 'python', executableArgs: [] };
  }

  const [executable, ...executableArgs] = tokens;
  return { executable, executableArgs };
};

const rejectAllPending = (message) => {
  for (const [, pending] of pendingRequests) {
    clearTimeout(pending.timeoutId);
    pending.reject(new Error(message));
  }
  pendingRequests.clear();
};

const handleWorkerMessage = (line, readyResolve, readyReject) => {
  let payload;

  try {
    payload = JSON.parse(line);
  } catch {
    return;
  }

  if (payload?.type === 'ready') {
    readyResolve();
    return;
  }

  const requestId = payload?.id;
  if (!requestId || !pendingRequests.has(requestId)) {
    return;
  }

  const pending = pendingRequests.get(requestId);
  pendingRequests.delete(requestId);
  clearTimeout(pending.timeoutId);

  if (payload.error) {
    pending.reject(new Error(payload.error));
    return;
  }

  const results = Array.isArray(payload.results) ? payload.results : [];
  pending.resolve(results);
};

const spawnRetrievalWorker = () => {
  if (retrievalWorker) {
    return retrievalWorkerReadyPromise;
  }

  const pythonCommandRaw = process.env.RAG_PYTHON_COMMAND || process.env.PYTHON_COMMAND || 'python';
  const { executable, executableArgs } = resolvePythonCommand(pythonCommandRaw);
  const defaultTopK = Number(process.env.RAG_TOP_K) || 5;

  retrievalWorkerReadyPromise = new Promise((resolve, reject) => {
    let isReady = false;

    retrievalWorker = spawn(
      executable,
      [
        ...executableArgs,
        RETRIEVAL_SERVER_SCRIPT_PATH,
        '--index',
        FAISS_INDEX_PATH,
        '--metadata',
        FAISS_METADATA_PATH,
        '--top-k',
        String(defaultTopK),
      ],
      {
        env: { ...process.env },
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    );

    retrievalBuffer = '';

    retrievalWorker.stdout.on('data', (chunk) => {
      retrievalBuffer += chunk.toString();
      const lines = retrievalBuffer.split('\n');
      retrievalBuffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          continue;
        }

        if (!isReady) {
          try {
            const payload = JSON.parse(trimmed);
            if (payload?.type === 'ready') {
              isReady = true;
              resolve();
              continue;
            }
          } catch {
            // Ignore non-JSON readiness noise.
          }
        }

        handleWorkerMessage(trimmed, resolve, reject);
      }
    });

    retrievalWorker.stderr.on('data', (chunk) => {
      const message = chunk.toString().trim();
      if (message) {
        console.error('[RAG retrieve worker]', message);
      }
    });

    retrievalWorker.on('error', (error) => {
      if (!isReady) {
        reject(new Error(`Failed to start retrieval worker: ${error.message}`));
      }
      rejectAllPending(`Retrieval worker error: ${error.message}`);
      retrievalWorker = null;
      retrievalWorkerReadyPromise = null;
    });

    retrievalWorker.on('close', (code) => {
      const closeMessage = `Retrieval worker exited with code ${code}`;
      if (!isReady) {
        reject(new Error(closeMessage));
      }
      rejectAllPending(closeMessage);
      retrievalWorker = null;
      retrievalWorkerReadyPromise = null;
    });
  });

  return retrievalWorkerReadyPromise;
};

export const stopRagRetriever = () => {
  if (retrievalWorker) {
    retrievalWorker.kill('SIGTERM');
    retrievalWorker = null;
    retrievalWorkerReadyPromise = null;
  }
};

export const initRagRetriever = async () => {
  const artifactsReady = await ragArtifactsExist();
  if (!artifactsReady) {
    throw new Error('RAG index files are missing. Run the index build script first.');
  }

  await spawnRetrievalWorker();
};

export const ragArtifactsExist = async () => {
  try {
    await Promise.all([fs.access(FAISS_INDEX_PATH), fs.access(FAISS_METADATA_PATH)]);
    return true;
  } catch {
    return false;
  }
};

export const retrieveRelevantTrips = async ({ query, topK = Number(process.env.RAG_TOP_K) || 5 }) => {
  if (!query || !query.trim()) {
    return [];
  }

  await initRagRetriever();

  const requestId = `rq_${Date.now()}_${++requestSequence}`;

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      pendingRequests.delete(requestId);
      reject(new Error(`RAG retrieval timed out after ${DEFAULT_RETRIEVE_TIMEOUT_MS} ms`));
    }, DEFAULT_RETRIEVE_TIMEOUT_MS);

    pendingRequests.set(requestId, { resolve, reject, timeoutId });

    const payload = JSON.stringify({
      id: requestId,
      query: query.trim(),
      top_k: topK,
    });

    retrievalWorker.stdin.write(`${payload}\n`, (error) => {
      if (!error) {
        return;
      }

      clearTimeout(timeoutId);
      pendingRequests.delete(requestId);
      reject(new Error(`Failed to send retrieval request: ${error.message}`));
    });
  });
};
