import { buildTripRagIndex } from '../services/rag/indexBuilder.js';
import {
  generateContextFallback,
  generateRagAnswer,
  isLlmUnavailableError,
} from '../services/rag/llm.service.js';
import {
  ragArtifactsExist,
  retrieveRelevantTrips,
} from '../services/rag/retriever.service.js';

const normalizeHistory = (history) => {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .map((entry) => {
      const role = entry?.role === 'assistant' || entry?.role === 'bot' ? 'assistant' : 'user';
      const content =
        typeof entry?.content === 'string'
          ? entry.content
          : typeof entry?.text === 'string'
          ? entry.text
          : '';

      if (!content.trim()) {
        return null;
      }

      return { role, content: content.trim() };
    })
    .filter(Boolean)
    .slice(-8);
};

const buildSources = (docs = []) =>
  docs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    destination: doc.destination,
    country: doc.country,
    durationDays: doc.durationDays,
    priceMin: doc.priceMin,
    priceMax: doc.priceMax,
    organizerName: doc.organizerName,
    score: doc.score,
  }));

export const chatbotStatus = async (_req, res) => {
  const indexReady = await ragArtifactsExist();

  res.status(200).json({
    success: true,
    data: {
      indexReady,
      embeddingModel: 'all-MiniLM-L6-v2',
      llmProvider: 'groq',
      llmModel: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
    },
  });
};

export const queryChatbot = async (req, res) => {
  const requestId = `chatbot-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  console.time(`[chatbot] total-request ${requestId}`);

  try {
    const { message, history = [], userRole = 'traveler' } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'message is required',
      });
    }

    const indexReady = await ragArtifactsExist();
    if (!indexReady) {
      return res.status(503).json({
        success: false,
        message:
          'RAG index not found. Build it first by running: npm run rag:build-index (inside backend).',
      });
    }

    const normalizedMessage = message.trim();
    const topK = Number(process.env.RAG_TOP_K) || 3;

    console.time(`[chatbot] faiss-retrieval ${requestId}`);
    const retrievedDocs = await retrieveRelevantTrips({ query: normalizedMessage, topK });
    console.timeEnd(`[chatbot] faiss-retrieval ${requestId}`);

    let reply = '';
    let llmUnavailable = false;

    try {
      reply = await generateRagAnswer({
        query: normalizedMessage,
        retrievedDocs,
        history: normalizeHistory(history),
        userRole,
      });
    } catch (llmError) {
      console.error('RAG LLM generation failed, using fallback:', llmError.message);
      llmUnavailable = isLlmUnavailableError(llmError);
      reply = generateContextFallback({ query: message.trim(), retrievedDocs });
    }

    return res.status(200).json({
      success: true,
      data: {
        reply,
        retrievedCount: retrievedDocs.length,
        sources: buildSources(retrievedDocs),
        meta: {
          llmUnavailable,
        },
      },
    });
  } catch (error) {
    console.error('Chatbot query error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating chatbot response',
      error: error.message,
    });
  } finally {
    console.timeEnd(`[chatbot] total-request ${requestId}`);
  }
};

export const rebuildChatbotIndex = async (_req, res) => {
  try {
    const summary = await buildTripRagIndex();

    return res.status(200).json({
      success: true,
      data: summary,
      message: 'RAG index built successfully',
    });
  } catch (error) {
    console.error('Rebuild chatbot index error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error rebuilding RAG index',
      error: error.message,
    });
  }
};
