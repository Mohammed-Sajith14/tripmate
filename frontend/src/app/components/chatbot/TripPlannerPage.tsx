import { useMemo, useState } from "react";
import { Bot, Route, Send, Sparkles } from "lucide-react";
import { LeftNav } from "../home/LeftNav";
import { TopBar } from "../home/TopBar";
import { BottomNav } from "../home/BottomNav";
import {
  TRAINED_TRIP_DATASET,
  TouristPlaceProfile,
  TravelRoutePlan,
} from "./trainingDataset";

import { API_BASE_URL } from "../../../utils/auth";

interface TripPlannerPageProps {
  isDark: boolean;
  toggleTheme: () => void;
  onNavigate: (page: string) => void;
}

type MessageSender = "user" | "bot";
type UserRole = "traveler" | "organizer";
type PlaceCategory = TouristPlaceProfile["category"];

interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
}

interface RouteIntent {
  from: string;
  to: string;
}

interface TripPreferences {
  days?: number;
  budgetTotal?: number;
}

interface BotReplyResult {
  text: string;
  inferredIntent: RouteIntent | null;
}

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizedAliases = Object.entries(TRAINED_TRIP_DATASET.aliases).reduce<
  Record<string, string>
>((accumulator, [rawKey, rawValue]) => {
  const key = normalizeText(rawKey);
  const value = normalizeText(rawValue);

  if (key && value) {
    accumulator[key] = value;
  }

  return accumulator;
}, {});

const normalizeLocationName = (value: string) => {
  const cleaned = normalizeText(value);

  if (!cleaned) {
    return "";
  }

  return normalizedAliases[cleaned] || cleaned;
};

const titleCase = (value: string) =>
  value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const routeLookup = new Map<string, TravelRoutePlan>();
const placeLookup = new Map<string, TouristPlaceProfile>();
const placesByState = new Map<string, TouristPlaceProfile[]>();
const stateDisplayLookup = new Map<string, string>();
const locationDisplayLookup = new Map<string, string>();
const knownLocations = new Set<string>();

const routeKey = (from: string, to: string) => `${from}__${to}`;

const registerLocation = (sourceName: string, displayName?: string) => {
  const canonical = normalizeLocationName(sourceName);

  if (!canonical) {
    return "";
  }

  knownLocations.add(canonical);

  if (!locationDisplayLookup.has(canonical)) {
    locationDisplayLookup.set(canonical, displayName || titleCase(sourceName));
  }

  return canonical;
};

TRAINED_TRIP_DATASET.routes.forEach((route) => {
  const from = registerLocation(route.from, titleCase(route.from));
  const to = registerLocation(route.to, titleCase(route.to));

  if (from && to) {
    routeLookup.set(routeKey(from, to), route);
  }
});

TRAINED_TRIP_DATASET.majorCities.forEach((city) => {
  registerLocation(city, city);
});

TRAINED_TRIP_DATASET.touristPlaces.forEach((place) => {
  const placeKey = registerLocation(place.name, place.name);
  const stateKey = normalizeLocationName(place.stateOrUT);

  if (placeKey && !placeLookup.has(placeKey)) {
    placeLookup.set(placeKey, place);
  }

  if (!stateDisplayLookup.has(stateKey)) {
    stateDisplayLookup.set(stateKey, place.stateOrUT);
  }

  const existing = placesByState.get(stateKey) || [];
  existing.push(place);
  placesByState.set(stateKey, existing);
});

TRAINED_TRIP_DATASET.statesAndUTs.forEach((state) => {
  const stateKey = normalizeLocationName(state);
  if (!stateDisplayLookup.has(stateKey)) {
    stateDisplayLookup.set(stateKey, state);
  }

  if (!placesByState.has(stateKey)) {
    placesByState.set(stateKey, []);
  }
});

const knownLocationCandidates = Array.from(
  new Set([...knownLocations, ...stateDisplayLookup.keys()])
);

const getEditDistance = (left: string, right: string) => {
  const rows = left.length + 1;
  const cols = right.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let row = 0; row < rows; row += 1) {
    matrix[row][0] = row;
  }

  for (let col = 0; col < cols; col += 1) {
    matrix[0][col] = col;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const substitutionCost = left[row - 1] === right[col - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + substitutionCost
      );
    }
  }

  return matrix[rows - 1][cols - 1];
};

const resolveKnownLocation = (value: string) => {
  const normalized = normalizeLocationName(value);

  if (!normalized) {
    return "";
  }

  if (knownLocations.has(normalized) || stateDisplayLookup.has(normalized)) {
    return normalized;
  }

  let bestCandidate = "";
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of knownLocationCandidates) {
    const lengthDiff = Math.abs(candidate.length - normalized.length);
    if (lengthDiff > 2) {
      continue;
    }

    if (candidate.startsWith(normalized) || normalized.startsWith(candidate)) {
      return candidate;
    }

    const distance = getEditDistance(normalized, candidate);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestCandidate = candidate;
    }
  }

  if (bestCandidate && bestDistance <= 2) {
    return bestCandidate;
  }

  return normalized;
};

const parseTripPreferences = (input: string): TripPreferences => {
  const normalized = input.toLowerCase();

  const dayMatch = normalized.match(/(\d+)\s*(?:day|days|night|nights|d)\b/);
  const days = dayMatch ? Number(dayMatch[1]) : undefined;

  const budgetPatterns = [
    /(?:budget|under|around|within)\s*(?:of)?\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/,
    /(?:₹|rs\.?|inr)\s*([\d,]+)/,
    /([\d,]+)\s*(?:budget|inr|rs)\b/,
  ];

  let budgetTotal: number | undefined;

  for (const pattern of budgetPatterns) {
    const matched = normalized.match(pattern);
    if (matched?.[1]) {
      const parsed = Number(matched[1].replace(/,/g, ""));
      if (!Number.isNaN(parsed) && parsed > 0) {
        budgetTotal = parsed;
        break;
      }
    }
  }

  if (!budgetTotal) {
    const numericCandidates = normalized.match(/\b\d{2,3}(?:,\d{3})+\b|\b\d{4,}\b/g);
    const parsedCandidate = numericCandidates
      ?.map((candidate) => Number(candidate.replace(/,/g, "")))
      .find((candidate) => !Number.isNaN(candidate) && candidate >= 1000);

    if (parsedCandidate) {
      budgetTotal = parsedCandidate;
    }
  }

  return {
    days: days && days > 0 ? days : undefined,
    budgetTotal,
  };
};

const formatInr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const buildPreferenceSummary = (preferences?: TripPreferences) => {
  if (!preferences?.days && !preferences?.budgetTotal) {
    return "";
  }

  const lines: string[] = [];

  if (preferences.days) {
    lines.push(`- Trip duration: ${preferences.days} day${preferences.days === 1 ? "" : "s"}`);
  }

  if (preferences.budgetTotal) {
    lines.push(`- Total budget: ${formatInr(preferences.budgetTotal)}`);
  }

  if (preferences.days && preferences.budgetTotal) {
    const perDay = Math.max(1, Math.round(preferences.budgetTotal / preferences.days));
    lines.push(`- Daily spend target: ~${formatInr(perDay)}`);
  }

  return `\n\nCustom Inputs Applied\n${lines.join("\n")}`;
};

const sanitizeLocationSegment = (segment: string, isDestination: boolean) => {
  let cleaned = segment
    .toLowerCase()
    .replace(
      /\b(i|want|to|go|travel|trip|plan|please|need|can|you|help|me|from|route|journey|vacation|visit|would|like|for|a|an|my|our|in|india)\b/g,
      " "
    );

  if (isDestination) {
    cleaned = cleaned.replace(
      /\b(for|in|on|this|next|week|month|days?|nights?|with|family|friends)\b.*$/,
      " "
    );
  }

  cleaned = cleaned.replace(/\s+/g, " ").trim();

  if (!cleaned) {
    return "";
  }

  const words = cleaned.split(" ");
  for (let size = Math.min(5, words.length); size >= 1; size -= 1) {
    const candidate = resolveKnownLocation(words.slice(-size).join(" "));
    if (knownLocations.has(candidate) || stateDisplayLookup.has(candidate)) {
      return candidate;
    }
  }

  return resolveKnownLocation(cleaned);
};

const parseRouteIntent = (input: string): RouteIntent | null => {
  const normalized = input
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized.includes(" to ")) {
    return null;
  }

  const explicitFrom = normalized.match(/from\s+([a-z\s]+?)\s+to\s+([a-z\s]+)/);
  const generic = normalized.match(/([a-z\s]+?)\s+to\s+([a-z\s]+)/);
  const matched = explicitFrom || generic;

  if (!matched) {
    return null;
  }

  const from = sanitizeLocationSegment(matched[1], false);
  const to = sanitizeLocationSegment(matched[2], true);

  if (!from || !to || from === to) {
    return null;
  }

  return { from, to };
};

const parseStateIntent = (input: string) => {
  const normalizedInput = normalizeText(input);
  const asksForPlaces =
    normalizedInput.includes("tourist") ||
    normalizedInput.includes("places") ||
    normalizedInput.includes("destinations") ||
    normalizedInput.includes("visit") ||
    normalizedInput.includes("explore");

  if (!asksForPlaces) {
    return "";
  }

  for (const [stateKey] of stateDisplayLookup) {
    if (
      normalizedInput.includes(` in ${stateKey}`) ||
      normalizedInput.includes(` of ${stateKey}`) ||
      normalizedInput.endsWith(stateKey)
    ) {
      return stateKey;
    }
  }

  return "";
};

const getDisplayLocation = (canonicalName: string) =>
  locationDisplayLookup.get(canonicalName) || titleCase(canonicalName);

interface CategoryGuidance {
  bestSeason: string;
  idealDuration: string;
  budget: {
    backpacker: string;
    comfort: string;
    premium: string;
  };
  packing: string[];
  safety: string[];
}

const CATEGORY_GUIDANCE: Record<PlaceCategory, CategoryGuidance> = {
  "hill-station": {
    bestSeason: "October to June",
    idealDuration: "3 to 4 days",
    budget: {
      backpacker: "₹2,800 to ₹4,500 per day",
      comfort: "₹5,000 to ₹8,000 per day",
      premium: "₹10,000+ per day",
    },
    packing: ["Light woollens", "Walking shoes", "Rain layer"],
    safety: ["Plan hill drives in daylight", "Keep weather buffer", "Carry offline maps"],
  },
  heritage: {
    bestSeason: "October to March",
    idealDuration: "2 to 3 days",
    budget: {
      backpacker: "₹2,500 to ₹4,000 per day",
      comfort: "₹4,500 to ₹7,000 per day",
      premium: "₹9,000+ per day",
    },
    packing: ["Comfortable footwear", "Sun protection", "Hydration bottle"],
    safety: ["Check monument timings", "Book major tickets in advance", "Keep local cab backup"],
  },
  spiritual: {
    bestSeason: "October to March",
    idealDuration: "2 to 3 days",
    budget: {
      backpacker: "₹2,200 to ₹3,800 per day",
      comfort: "₹4,000 to ₹6,500 per day",
      premium: "₹8,500+ per day",
    },
    packing: ["Modest clothing", "Slip-on footwear", "Personal medication"],
    safety: ["Follow temple timings", "Expect crowd buffers", "Use official queue systems"],
  },
  beach: {
    bestSeason: "November to March",
    idealDuration: "2 to 4 days",
    budget: {
      backpacker: "₹2,800 to ₹4,500 per day",
      comfort: "₹5,000 to ₹8,500 per day",
      premium: "₹11,000+ per day",
    },
    packing: ["Cotton clothing", "Sunblock", "Hydration and hats"],
    safety: ["Follow lifeguard zones", "Avoid late-night isolated beaches", "Check tide conditions"],
  },
  wildlife: {
    bestSeason: "October to June",
    idealDuration: "3 days",
    budget: {
      backpacker: "₹3,200 to ₹5,000 per day",
      comfort: "₹5,500 to ₹8,500 per day",
      premium: "₹11,000+ per day",
    },
    packing: ["Earth-tone clothes", "Binoculars", "Insect repellent"],
    safety: ["Use authorized safari operators", "Follow forest rules", "Keep emergency contacts ready"],
  },
  nature: {
    bestSeason: "September to March",
    idealDuration: "2 to 4 days",
    budget: {
      backpacker: "₹2,800 to ₹4,300 per day",
      comfort: "₹4,800 to ₹7,500 per day",
      premium: "₹9,500+ per day",
    },
    packing: ["Trek-friendly shoes", "Light layers", "Power backup"],
    safety: ["Start hikes early", "Track weather alerts", "Keep local emergency numbers"],
  },
  desert: {
    bestSeason: "November to February",
    idealDuration: "2 to 3 days",
    budget: {
      backpacker: "₹3,000 to ₹4,800 per day",
      comfort: "₹5,200 to ₹8,200 per day",
      premium: "₹10,000+ per day",
    },
    packing: ["Sun protection", "Hydration packs", "Light scarf"],
    safety: ["Avoid midday exposure", "Use guided desert activities", "Carry cash + UPI backup"],
  },
  island: {
    bestSeason: "November to April",
    idealDuration: "4 to 5 days",
    budget: {
      backpacker: "₹4,000 to ₹6,000 per day",
      comfort: "₹7,000 to ₹11,000 per day",
      premium: "₹14,000+ per day",
    },
    packing: ["Beachwear", "Waterproof bags", "Government ID copies"],
    safety: ["Check ferry schedules", "Track weather and sea status", "Book permits early where needed"],
  },
  "city-break": {
    bestSeason: "October to March",
    idealDuration: "2 to 3 days",
    budget: {
      backpacker: "₹2,700 to ₹4,500 per day",
      comfort: "₹4,800 to ₹7,500 per day",
      premium: "₹10,000+ per day",
    },
    packing: ["Comfortable walking shoes", "Digital payment options", "Day backpack"],
    safety: ["Prefer trusted transport apps", "Avoid isolated late-night areas", "Keep hotel contact handy"],
  },
  adventure: {
    bestSeason: "March to June and September to November",
    idealDuration: "3 to 5 days",
    budget: {
      backpacker: "₹3,500 to ₹5,500 per day",
      comfort: "₹6,000 to ₹9,500 per day",
      premium: "₹12,000+ per day",
    },
    packing: ["Activity-specific gear", "High-energy snacks", "Weatherproof jacket"],
    safety: ["Use certified operators", "Follow altitude acclimatization", "Keep medical kit ready"],
  },
  backwaters: {
    bestSeason: "October to March",
    idealDuration: "2 to 3 days",
    budget: {
      backpacker: "₹3,200 to ₹4,800 per day",
      comfort: "₹5,500 to ₹8,500 per day",
      premium: "₹11,000+ per day",
    },
    packing: ["Cotton wear", "Mosquito repellent", "Light rain protection"],
    safety: ["Use registered boat operators", "Check weather before cruises", "Keep essentials waterproofed"],
  },
};

const formatRoutePlan = (
  route: TravelRoutePlan,
  userRole: UserRole,
  preferences?: TripPreferences
) => {
  const transportLines = route.transportOptions
    .map(
      (option, index) =>
        `${index + 1}. ${option.mode}: ${option.duration}, ${option.estimatedCost}. ${option.notes}`
    )
    .join("\n");

  const itineraryLines = route.dayWisePlan
    .map(
      (day) =>
        `Day ${day.day} - ${day.title}\n- ${day.activities.join("\n- ")}`
    )
    .join("\n\n");

  const roleChecklist =
    userRole === "organizer" ? route.organizerChecklist : route.travelerChecklist;

  return `Complete Trip Guidance: ${titleCase(route.from)} → ${titleCase(route.to)}\n\n1) Route Snapshot\n- Distance: ${route.distanceKm} km\n- Best season: ${route.bestSeason}\n- Ideal duration: ${route.idealDuration}\n\n2) Travel Options\n${transportLines}\n\n3) Suggested Itinerary\n${itineraryLines}\n\n4) Budget Estimate\n- Backpacker: ${route.budget.backpacker}\n- Comfort: ${route.budget.comfort}\n- Premium: ${route.budget.premium}\n\n5) Stay + Food\n- Stay zones: ${route.stayRecommendations.join(", ")}\n- Must-try food: ${route.foodToTry.join(", ")}\n\n6) Packing + Safety\n- Packing: ${route.packingChecklist.join("; ")}\n- Safety: ${route.safetyTips.join("; ")}\n\n7) ${userRole === "organizer" ? "Organizer" : "Traveler"} Action Checklist\n- ${roleChecklist.join("\n- ")}${buildPreferenceSummary(
    preferences
  )}`;
};

const buildPlaceBasedRoutePlan = (
  intent: RouteIntent,
  place: TouristPlaceProfile,
  userRole: UserRole,
  preferences?: TripPreferences
) => {
  const guidance = CATEGORY_GUIDANCE[place.category];
  const fromLabel = getDisplayLocation(intent.from);
  const toLabel = place.name;
  const gatewayKey = normalizeLocationName(place.nearestGateway);
  const gatewayLabel = getDisplayLocation(gatewayKey);

  const transportGuide =
    intent.from === gatewayKey
      ? `You are already at the primary gateway (${gatewayLabel}), so use direct local transfer to ${toLabel}.`
      : `Reach ${gatewayLabel} from ${fromLabel} by flight/train first, then continue by road to ${toLabel}.`;

  const [highlightOne, highlightTwo, highlightThree, highlightFour] = [
    ...place.highlights,
    "Local market and culture walk",
    "Signature viewpoint",
    "Leisure stop",
  ];

  const roleChecklist =
    userRole === "organizer"
      ? [
          "Confirm transport legs and transfer buffers with vendors",
          "Pre-block meal and washroom halts for group flow",
          "Share day-wise plan and emergency contacts before departure",
        ]
      : [
          "Lock transport + stay bookings early",
          "Keep one buffer slot for weather/traffic",
          "Download offline maps and keep digital ID copies",
        ];

  return `Complete Trip Guidance: ${fromLabel} → ${toLabel}

1) Destination Snapshot
- State/UT: ${place.stateOrUT}
- Travel style: ${titleCase(place.category.replace(/-/g, " "))}
- Best season: ${place.bestSeason || guidance.bestSeason}
- Ideal duration: ${place.idealDuration || guidance.idealDuration}

2) Travel Plan
- ${transportGuide}
- Add a 1-2 hour transfer buffer on travel days.

3) Suggested Itinerary
Day 1 - Arrival and orientation
- Check in and local transfer
- ${highlightOne}
- Evening food walk and rest

Day 2 - Core experiences
- ${highlightTwo}
- ${highlightThree}
- Sunset/photo point

Day 3 - Local experiences and return
- ${highlightFour}
- Souvenir and cuisine stop
- Return planning and departure

4) Budget Estimate (per day)
- Backpacker: ${guidance.budget.backpacker}
- Comfort: ${guidance.budget.comfort}
- Premium: ${guidance.budget.premium}

5) Packing + Safety
- Packing: ${guidance.packing.join("; ")}
- Safety: ${guidance.safety.join("; ")}

6) ${userRole === "organizer" ? "Organizer" : "Traveler"} Action Checklist
- ${roleChecklist.join("\n- ")}${buildPreferenceSummary(preferences)}`;
};

const buildCityBreakPlan = (
  intent: RouteIntent,
  userRole: UserRole,
  preferences?: TripPreferences
) => {
  const fromLabel = getDisplayLocation(intent.from);
  const toLabel = getDisplayLocation(intent.to);
  const cityGuidance = CATEGORY_GUIDANCE["city-break"];
  const roleTip =
    userRole === "organizer"
      ? "Set fixed meetup points, local transit windows, and buffer meal breaks for group logistics."
      : "Book central stays, confirm local transport app coverage, and keep evening return windows clear.";

  return `Complete Trip Guidance: ${fromLabel} → ${toLabel}

1) City Trip Snapshot
- Best season: ${cityGuidance.bestSeason}
- Ideal duration: ${cityGuidance.idealDuration}
- Focus: heritage + local food + market neighborhoods

2) Suggested 3-Day Plan
Day 1 - Arrival and landmark circuit
- Check in near city center
- Cover 2 flagship attractions
- Evening local market walk

Day 2 - Culture and food trail
- Museum/heritage block in morning
- Signature food street for lunch and dinner
- Optional riverfront/night district visit

Day 3 - Flexible experiences + return
- One hidden-gem neighborhood
- Shopping and cafe stop
- Return transfer with traffic buffer

3) Budget Estimate (per day)
- Backpacker: ${cityGuidance.budget.backpacker}
- Comfort: ${cityGuidance.budget.comfort}
- Premium: ${cityGuidance.budget.premium}

4) Practical Tips
- Packing: ${cityGuidance.packing.join("; ")}
- Safety: ${cityGuidance.safety.join("; ")}

5) Role Action Tip
- ${roleTip}${buildPreferenceSummary(preferences)}`;
};

const buildFallbackRoutePlan = (
  intent: RouteIntent,
  userRole: UserRole,
  preferences?: TripPreferences
) => {
  const roleLine =
    userRole === "organizer"
      ? "As an organizer, add transport buffers, group meal slots, and vendor confirmations."
      : "As a traveler, lock transport, hotel, and return timing first to avoid peak-price changes.";

  const hasPreferences = Boolean(preferences?.days || preferences?.budgetTotal);

  return `I can draft a complete custom plan for ${titleCase(intent.from)} → ${titleCase(
    intent.to
  )}.\n\nUse this quick structure now:\n1) Pick travel mode + travel time windows\n2) Set trip duration (2/3/4+ days)\n3) Split itinerary into arrival, core sightseeing, return\n4) Allocate budget into stay, transport, food, activity, emergency\n5) Finalize packing by weather and terrain\n\n${roleLine}${buildPreferenceSummary(
    preferences
  )}\n\n${
    hasPreferences
      ? "If you share one preferred destination highlight, I’ll tailor a day-wise plan for that exact place."
      : "Share your number of days and budget and I’ll generate a detailed custom plan instantly."
  }`;
};

const buildStatePlacesResponse = (stateKey: string) => {
  const places = placesByState.get(stateKey) || [];
  const stateLabel = stateDisplayLookup.get(stateKey) || titleCase(stateKey);

  if (!places.length) {
    return `I can help with ${stateLabel}, but I need a route prompt to create full guidance. Try: Plan from Delhi to ${stateLabel}.`;
  }

  const topPlaces = places.slice(0, 10).map((place) => `- ${place.name}`);

  return `Top tourist places in ${stateLabel}:\n${topPlaces.join(
    "\n"
  )}\n\nFor complete trip guidance, send a route like: from your city to any of these places.`;
};

const buildStateBasedRoutePlan = (
  intent: RouteIntent,
  stateKey: string,
  userRole: UserRole,
  preferences?: TripPreferences
) => {
  const stateLabel = stateDisplayLookup.get(stateKey) || titleCase(stateKey);
  const places = (placesByState.get(stateKey) || []).slice(0, 6);
  const fromLabel = getDisplayLocation(intent.from);

  if (!places.length) {
    return buildFallbackRoutePlan(intent, userRole, preferences);
  }

  const gatewayKey = normalizeLocationName(places[0].nearestGateway);
  const gatewayLabel = getDisplayLocation(gatewayKey);
  const [spot1, spot2, spot3, spot4] = [
    ...places.map((place) => place.name),
    "Local cultural district",
    "Scenic transit route",
    "Cuisine and market walk",
    "Leisure exploration",
  ];

  const totalDays = preferences?.days || 4;
  const extraDaysLine =
    totalDays > 3
      ? `Day 4${totalDays > 4 ? ` to ${totalDays}` : ""} - Flexible exploration, buffer for weather/road changes, and return logistics`
      : "";

  const budgetLine = preferences?.budgetTotal
    ? `- Recommended daily target: ~${formatInr(
        Math.max(1, Math.round(preferences.budgetTotal / totalDays))
      )}`
    : "";

  const roleLine =
    userRole === "organizer"
      ? "As organizer, keep acclimatization/transfer buffers and pre-confirm all permits and vehicle windows."
      : "As traveler, keep one weather buffer slot and avoid tight return connections after remote sightseeing legs.";

  return `Complete Trip Guidance: ${fromLabel} → ${stateLabel}

1) State Circuit Snapshot
- Suggested duration: ${totalDays} day${totalDays === 1 ? "" : "s"}
- Core gateway: ${gatewayLabel}
- Top circuit highlights: ${spot1}, ${spot2}, ${spot3}

2) Travel Flow
- Reach ${gatewayLabel} from ${fromLabel} by flight/train first.
- Use local road circuit for places like ${spot1}, ${spot2}, and ${spot3}.
- Keep 1-2 hour transfer buffers on movement-heavy days.

3) Suggested Itinerary
Day 1 - Arrival and orientation
- Check in and local acclimatization/orientation
- Evening local walk and light activity

Day 2 - Core sightseeing circuit
- ${spot1}
- ${spot2}
- Sunset viewpoint / local experience

Day 3 - Extended circuit and return prep
- ${spot3}
- ${spot4}
- Return staging and departure prep

${extraDaysLine}

4) Budget + Execution Notes
- Plan transport + stays first, then activities and buffer funds
${budgetLine}
- ${roleLine}${buildPreferenceSummary(preferences)}`;
};

const buildPlanFromIntent = (
  intent: RouteIntent,
  userRole: UserRole,
  preferences?: TripPreferences
) => {
  const routePlan = routeLookup.get(routeKey(intent.from, intent.to));

  if (routePlan) {
    return formatRoutePlan(routePlan, userRole, preferences);
  }

  const destinationPlace = placeLookup.get(intent.to);

  if (destinationPlace) {
    return buildPlaceBasedRoutePlan(intent, destinationPlace, userRole, preferences);
  }

  if (stateDisplayLookup.has(intent.to)) {
    return buildStateBasedRoutePlan(intent, intent.to, userRole, preferences);
  }

  if (knownLocations.has(intent.to)) {
    return buildCityBreakPlan(intent, userRole, preferences);
  }

  return buildFallbackRoutePlan(intent, userRole, preferences);
};

const getKeywordResponse = (
  input: string,
  userRole: UserRole
) => {
  const lower = input.toLowerCase();

  if (lower.includes("major cities")) {
    const sampleCities = TRAINED_TRIP_DATASET.majorCities.slice(0, 12).join(", ");
    return `I’m trained with ${TRAINED_TRIP_DATASET.majorCities.length} major Indian cities. Examples: ${sampleCities}.`;
  }

  if (
    lower.includes("tourist places in india") ||
    (lower.includes("tourist places") && lower.includes("india"))
  ) {
    return `I currently cover ${TRAINED_TRIP_DATASET.touristPlaces.length} major tourist places across ${TRAINED_TRIP_DATASET.statesAndUTs.length} states and UTs in India.`;
  }

  if (lower.includes("budget")) {
    return TRAINED_TRIP_DATASET.quickTips.budget;
  }

  if (lower.includes("pack") || lower.includes("luggage")) {
    return TRAINED_TRIP_DATASET.quickTips.packing;
  }

  if (lower.includes("permit") || lower.includes("entry")) {
    return TRAINED_TRIP_DATASET.quickTips.permits;
  }

  if (lower.includes("safe") || lower.includes("safety")) {
    return TRAINED_TRIP_DATASET.quickTips.safety;
  }

  return userRole === "organizer"
    ? "Share the route (example: from Coimbatore to Ooty), group size, and budget band. I will create a full organizer-ready trip operation plan."
    : "Tell me your route (example: from Coimbatore to Ooty), trip days, and budget. I will generate a complete travel-ready plan.";
};

const buildBotReply = (
  input: string,
  userRole: UserRole,
  activeIntent: RouteIntent | null
): BotReplyResult => {
  const parsedIntent = parseRouteIntent(input);
  const preferences = parseTripPreferences(input);
  const hasPreferences = Boolean(preferences.days || preferences.budgetTotal);

  if (parsedIntent) {
    return {
      text: buildPlanFromIntent(parsedIntent, userRole, preferences),
      inferredIntent: parsedIntent,
    };
  }

  if (hasPreferences && activeIntent) {
    return {
      text: buildPlanFromIntent(activeIntent, userRole, preferences),
      inferredIntent: activeIntent,
    };
  }

  const stateIntent = parseStateIntent(input);
  if (stateIntent) {
    return {
      text: buildStatePlacesResponse(stateIntent),
      inferredIntent: activeIntent,
    };
  }

  return {
    text: getKeywordResponse(input, userRole),
    inferredIntent: activeIntent,
  };
};

const getCurrentUserRole = (): "traveler" | "organizer" => {
  try {
    const stored = localStorage.getItem("user");
    if (!stored) {
      return "traveler";
    }

    const parsed = JSON.parse(stored);
    return parsed?.role === "organizer" ? "organizer" : "traveler";
  } catch {
    return "traveler";
  }
};

export function TripPlannerPage({ isDark, toggleTheme, onNavigate }: TripPlannerPageProps) {
  const userRole = useMemo(getCurrentUserRole, []);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-bot",
      sender: "bot",
      text:
        "Hi! I’m your Trip Planner chatbot. I’m trained with major cities and tourist places across India and can generate complete trip guidance.\n\nTry: I want to go from coimbatore to ooty",
    },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastIntent, setLastIntent] = useState<RouteIntent | null>(null);

  const quickPrompts = [
    "Plan from Coimbatore to Ooty",
    "Plan from Delhi to Leh",
    "Plan from Mumbai to Havelock Island",
    "Tourist places in Rajasthan",
    "I need a budget trip from Bangalore to Coorg",
    "Give me a 2-day Chennai to Pondicherry plan",
  ];

  const sendUserMessage = async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || isGenerating) {
      return;
    }

    const fallbackReply = buildBotReply(trimmed, userRole, lastIntent);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
    };

    const historyForBackend = messages.slice(-8).map((entry) => ({
      role: entry.sender === "user" ? "user" : "assistant",
      content: entry.text,
    }));

    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          history: historyForBackend,
          userRole,
        }),
      });

      const data = await response.json().catch(() => null);

      const backendReply =
        response.ok && data?.success && typeof data?.data?.reply === "string"
          ? data.data.reply
          : null;

      const llmUnavailable = Boolean(data?.data?.meta?.llmUnavailable);

      const replyText =
        backendReply && !llmUnavailable
          ? backendReply
          : fallbackReply.text;

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: replyText,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: fallbackReply.text,
      };

      setMessages((prev) => [...prev, botMessage]);
    } finally {
      if (fallbackReply.inferredIntent) {
        setLastIntent(fallbackReply.inferredIntent);
      }

      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    const currentInput = input;
    setInput("");
    await sendUserMessage(currentInput);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <LeftNav activePage="planner" onNavigate={onNavigate} />
      <TopBar isDark={isDark} toggleTheme={toggleTheme} />

      <div className="lg:ml-64 pt-16 pb-16 lg:pb-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bot className="size-6 text-teal-500" />
                  Trip Planner Chatbot
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  Plan complete trips with route, itinerary, budget, packing, and safety guidance.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                <Sparkles className="size-4" />
                {userRole === "organizer" ? "Organizer Mode" : "Traveler Mode"}
              </span>
            </div>

            <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Trained dataset covers {TRAINED_TRIP_DATASET.majorCities.length} major cities and{" "}
              {TRAINED_TRIP_DATASET.touristPlaces.length} major tourist places across {" "}
              {TRAINED_TRIP_DATASET.statesAndUTs.length} Indian states and UTs.
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Route className="size-4 text-teal-500" />
                Quick prompts
              </p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      void sendUserMessage(prompt);
                    }}
                    className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[52vh] overflow-y-auto p-4 space-y-4 bg-slate-50/60 dark:bg-slate-950/40">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[78%] rounded-2xl px-4 py-3 whitespace-pre-wrap text-sm leading-relaxed ${
                      message.sender === "user"
                        ? "bg-teal-500 text-white"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                    Planning your trip guidance...
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      void handleSend();
                    }
                  }}
                  placeholder="Type a route or ask places by state, e.g. from Coimbatore to Ooty or tourist places in Rajasthan"
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                <button
                  onClick={() => {
                    void handleSend();
                  }}
                  disabled={!input.trim() || isGenerating}
                  className="px-4 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400 disabled:cursor-not-allowed text-white transition-colors"
                >
                  <Send className="size-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav activePage="planner" onNavigate={onNavigate} />
    </div>
  );
}
