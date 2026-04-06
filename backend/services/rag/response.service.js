const DEFAULT_MIN_RETRIEVAL_SCORE = 0.2;

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

export const generateRetrievalAnswer = async ({ query, retrievedDocs = [] }) =>
  generateRetrievalFallback({ query, retrievedDocs });

export const generateRetrievalFallback = ({ query, retrievedDocs = [] }) => {
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
