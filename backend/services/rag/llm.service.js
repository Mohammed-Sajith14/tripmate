const MAX_HISTORY_MESSAGES = Number(process.env.RAG_MAX_HISTORY_MESSAGES) || 4;
const DEFAULT_MIN_RETRIEVAL_SCORE = 0.2;
const DEFAULT_CONTEXT_RESULTS = Number(process.env.RAG_CONTEXT_RESULTS) || 3;
const DEFAULT_CONTEXT_CHARS = Number(process.env.RAG_CONTEXT_MAX_CHARS) || 320;
const DEFAULT_HISTORY_CHARS = Number(process.env.RAG_HISTORY_MAX_CHARS) || 180;
const DEFAULT_GROQ_TIMEOUT_MS = Number(process.env.GROQ_TIMEOUT_MS) || 5000;

const truncateText = (value, maxChars) => {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (!normalized) {
    return '';
  }

  if (normalized.length <= maxChars) {
    return normalized;
  }

  return `${normalized.slice(0, maxChars)}...`;
};

const normalizeText = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const buildSearchableDocText = (doc = {}) =>
  normalizeText(
    [doc.title, doc.destination, doc.locationName, doc.country, doc.description, doc.content]
      .filter((value) => typeof value === 'string' && value.trim())
      .join(' ')
  );

const extractRouteIntent = (query = '') => {
  const match = String(query).match(/\bfrom\s+([a-z\s]{2,})\s+to\s+([a-z\s]{2,})\b/i);

  if (!match) {
    return null;
  }

  const from = normalizeText(match[1]);
  const to = normalizeText(match[2]);

  if (!from || !to) {
    return null;
  }

  return { from, to };
};

const getMinRetrievalScore = () => {
  const parsed = Number(process.env.RAG_MIN_SCORE);
  return Number.isFinite(parsed) ? parsed : DEFAULT_MIN_RETRIEVAL_SCORE;
};

export const isLlmUnavailableError = (error) => {
  const message = String(error?.message || '').toLowerCase();

  return [
    'fetch failed',
    'failed to fetch',
    'econnrefused',
    'connect econnrefused',
    'socket hang up',
    'timed out',
    'timeout',
    'getaddrinfo',
    'networkerror',
    'network error',
  ].some((pattern) => message.includes(pattern));
};

const buildContextBlock = (retrievedDocs = []) => {
  if (!retrievedDocs.length) {
    return 'No relevant trip documents were retrieved from the knowledge base.';
  }

  return retrievedDocs
    .slice(0, DEFAULT_CONTEXT_RESULTS)
    .map((doc, index) => {
      const priceLine =
        typeof doc.priceMin === 'number' && typeof doc.priceMax === 'number'
          ? `INR ${doc.priceMin} - INR ${doc.priceMax}`
          : 'Price not available';

      return [
        `Result ${index + 1}:`,
        `Trip: ${doc.title || 'Untitled'}`,
        `Destination: ${doc.destination || 'Unknown'}, ${doc.country || ''}`,
        `Duration: ${doc.durationDays ? `${doc.durationDays} days` : 'Not specified'}`,
        `Budget: ${priceLine}`,
        `Score: ${typeof doc.score === 'number' ? doc.score.toFixed(3) : 'N/A'}`,
        `Description: ${truncateText(doc.description || 'No description provided', DEFAULT_CONTEXT_CHARS)}`,
        `Itinerary: ${Array.isArray(doc.itinerary) && doc.itinerary.length > 0
          ? doc.itinerary
              .slice(0, 2)
              .map((item) => `Day ${item.day || '?'} ${item.title || ''}`.trim())
              .join(' | ')
          : 'Not provided'}`,
        `Context: ${truncateText(doc.content || '', DEFAULT_CONTEXT_CHARS)}`,
      ].join('\n');
    })
    .join('\n\n');
};

const normalizeHistory = (history = []) => {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .map((entry) => {
      const role =
        entry?.role === 'assistant' || entry?.role === 'bot' ? 'assistant' : 'user';
      const content = typeof entry?.content === 'string' ? entry.content : '';

      if (!content.trim()) {
        return null;
      }

      return { role, content: truncateText(content, DEFAULT_HISTORY_CHARS) };
    })
    .filter(Boolean)
    .slice(-MAX_HISTORY_MESSAGES);
};

export const generateRagAnswer = async ({
  query,
  retrievedDocs = [],
  history = [],
  userRole = 'traveler',
}) => {
  const groqApiKey = process.env.GROQ_API_KEY;
  const groqBaseUrl = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
  const groqModel = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY is not configured.');
  }

  console.time('[llm] prompt-construction');

  const systemPrompt = [
    'You are TripMate, a travel-planning assistant.',
    'Follow these rules automatically without needing user instructions:',
    '- For general travel suggestions, recommend destinations first.',
    '- For booking, itinerary, package, budget, or route planning, use the retrieved RAG trip package context.',
    '- If retrieved context exists, mention package recommendations as an optional suggestion only.',
    '- Do not force package recommendations for general questions.',
    '- For month or season-specific queries, prioritize destinations based on weather and travel suitability.',
    '- Keep responses concise, actionable, and user-friendly.',
    `- User role: ${userRole}. Tailor the depth of advice accordingly.`,
  ].join(' ');

  const contextBlock = buildContextBlock(retrievedDocs);
  const finalPrompt = [
    `User query: ${query}`,
    '',
    'Retrieved trip context:',
    contextBlock,
    '',
    'Answer with the behavior rules above. Use the retrieved context when relevant, and keep the response short and practical.',
  ].join('\n');

  console.timeEnd('[llm] prompt-construction');

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), DEFAULT_GROQ_TIMEOUT_MS);

  console.time('[llm] groq-api-response');

  let response;
  let data;

  try {
    response = await fetch(`${groqBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`,
      },
      signal: abortController.signal,
      body: JSON.stringify({
        model: groqModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: finalPrompt },
        ],
        temperature: 0.2,
      }),
    });

    data = await response.json().catch(() => null);
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`Groq request timed out after ${DEFAULT_GROQ_TIMEOUT_MS} ms`);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
    console.timeEnd('[llm] groq-api-response');
  }

  if (!response.ok) {
    const errorMessage =
      data?.error?.message || data?.error || `LLM request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  const answer = data?.choices?.[0]?.message?.content?.trim();
  if (!answer) {
    throw new Error('LLM returned an empty response.');
  }

  return answer;
};

export const generateContextFallback = ({ query, retrievedDocs = [] }) => {
  if (!retrievedDocs.length) {
    return `I could not find matching trips in the knowledge base for "${query}". Try adding destination, budget, or trip duration.`;
  }

  const routeIntent = extractRouteIntent(query);
  const minScore = getMinRetrievalScore();

  const scoreFilteredDocs = retrievedDocs.filter(
    (doc) => typeof doc?.score !== 'number' || doc.score >= minScore
  );

  const candidateDocs = scoreFilteredDocs.length ? scoreFilteredDocs : retrievedDocs;

  let displayDocs = candidateDocs;

  if (routeIntent) {
    const destinationMatchedDocs = candidateDocs.filter((doc) => {
      const searchable = buildSearchableDocText(doc);
      return searchable.includes(routeIntent.to);
    });

    if (destinationMatchedDocs.length) {
      displayDocs = destinationMatchedDocs;
    } else {
      return [
        `I could not find a direct TripMate listing from ${routeIntent.from} to ${routeIntent.to} right now.`,
        'You can still ask for nearby alternatives, custom budget, or number of days and I will plan an option for you.',
      ].join('\n\n');
    }
  }

  if (!displayDocs.length) {
    return `I found only weak matches for "${query}". Try adding a clearer destination, number of days, or budget range.`;
  }

  const options = displayDocs.slice(0, 3).map((doc, index) => {
    const budget =
      typeof doc.priceMin === 'number' && typeof doc.priceMax === 'number'
        ? `INR ${doc.priceMin}-${doc.priceMax}`
        : 'Budget unavailable';

    const duration = doc.durationDays ? `${doc.durationDays} days` : 'Duration not specified';

    return `${index + 1}. ${doc.title} in ${doc.destination} (${duration}, ${budget})`;
  });

  return `I found relevant trips for your request:\n${options.join('\n')}`;
};
