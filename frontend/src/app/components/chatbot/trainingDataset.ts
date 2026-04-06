import {
  INDIA_MAJOR_CITIES,
  INDIA_STATES_AND_UTS,
  INDIA_TOURIST_PLACES,
  PlaceCategory,
} from "./indiaTravelCoverage";

export interface TransportOption {
  mode: string;
  duration: string;
  estimatedCost: string;
  notes: string;
}

export interface DayPlan {
  day: number;
  title: string;
  activities: string[];
}

export interface RouteBudget {
  backpacker: string;
  comfort: string;
  premium: string;
}

export interface TouristPlaceProfile {
  name: string;
  stateOrUT: string;
  category: PlaceCategory;
  nearestGateway: string;
  highlights: string[];
  bestSeason?: string;
  idealDuration?: string;
}

export interface TravelRoutePlan {
  from: string;
  to: string;
  distanceKm: number;
  bestSeason: string;
  idealDuration: string;
  transportOptions: TransportOption[];
  dayWisePlan: DayPlan[];
  budget: RouteBudget;
  stayRecommendations: string[];
  foodToTry: string[];
  packingChecklist: string[];
  safetyTips: string[];
  travelerChecklist: string[];
  organizerChecklist: string[];
}

export interface TrainedTripDataset {
  aliases: Record<string, string>;
  routes: TravelRoutePlan[];
  majorCities: string[];
  touristPlaces: TouristPlaceProfile[];
  statesAndUTs: string[];
  quickTips: Record<string, string>;
}

export const TRAINED_TRIP_DATASET: TrainedTripDataset = {
  aliases: {
    cokmbatore: "coimbatore",
    coimabtore: "coimbatore",
    coimatore: "coimbatore",
    kovai: "coimbatore",
    bengaluru: "bangalore",
    banglore: "bangalore",
    mysore: "mysuru",
    calicut: "kozhikode",
    trivandrum: "thiruvananthapuram",
    cochin: "kochi",
    vizag: "visakhapatnam",
    baroda: "vadodara",
    bombay: "mumbai",
    madras: "chennai",
    pondi: "pondicherry",
    pondy: "pondicherry",
    puducherry: "pondicherry",
    simla: "shimla",
    gurgaon: "gurugram",
    allahabad: "prayagraj",
    benaras: "varanasi",
    banaras: "varanasi",
    kashi: "varanasi",
    "jammu kashmir": "jammu and kashmir",
    kolkatta: "kolkata",
    tirupathi: "tirupati",
    rameshwaram: "rameswaram",
    "leh ladakh": "leh",
    ladkh: "ladakh",
    ladak: "ladakh",
    ladhak: "ladakh",
    ladakh: "ladakh",
    andaman: "andaman and nicobar islands",
    uttarakhand: "uttarakhand",
    tamilnadu: "tamil nadu",
    maharastra: "maharashtra",
    bengal: "west bengal",
    odissa: "odisha",
    kodaiknal: "kodaikanal",
    jaiselmer: "jaisalmer",
    ootyh: "ooty",
    udhagamandalam: "ooty",
    ootacamund: "ooty",
  },
  routes: [
    {
      from: "coimbatore",
      to: "ooty",
      distanceKm: 86,
      bestSeason: "October to June (pleasant weather, great for sightseeing)",
      idealDuration: "3 days / 2 nights",
      transportOptions: [
        {
          mode: "Private cab / taxi",
          duration: "3 to 3.5 hours",
          estimatedCost: "₹2,800 to ₹4,500 (one way)",
          notes: "Best comfort option. Start early to avoid ghat traffic.",
        },
        {
          mode: "TNSTC / private bus",
          duration: "4 to 5 hours",
          estimatedCost: "₹220 to ₹450 per person",
          notes: "Budget friendly. Frequent departures from Gandhipuram.",
        },
        {
          mode: "Train + Nilgiri toy train",
          duration: "~1 hour (Coimbatore→Mettupalayam) + ~5 hours (toy train)",
          estimatedCost: "₹50 to ₹150 + ₹250 to ₹1,000 per person",
          notes: "Scenic route. Book toy train tickets in advance.",
        },
      ],
      dayWisePlan: [
        {
          day: 1,
          title: "Arrival and Ooty town highlights",
          activities: [
            "Check-in and freshen up",
            "Visit Botanical Garden",
            "Boating at Ooty Lake by evening",
            "Walk around Charing Cross market",
          ],
        },
        {
          day: 2,
          title: "Nature and viewpoints",
          activities: [
            "Sunrise at Doddabetta Peak",
            "Tea Factory & Museum tour",
            "Pine Forest and Shooting Point",
            "Sunset at Wenlock Downs",
          ],
        },
        {
          day: 3,
          title: "Coonoor side trip and return",
          activities: [
            "Visit Sim’s Park, Coonoor",
            "Dolphin’s Nose viewpoint",
            "Lunch and local tea shopping",
            "Return to Coimbatore",
          ],
        },
      ],
      budget: {
        backpacker: "₹3,000 to ₹4,500 per day",
        comfort: "₹5,500 to ₹8,500 per day",
        premium: "₹12,000+ per day",
      },
      stayRecommendations: [
        "Near Charing Cross for market access",
        "Fern Hill for calm views",
        "Lovedale for peaceful family stays",
      ],
      foodToTry: [
        "Ooty varkey and homemade chocolates",
        "Nilgiri tea",
        "Hot masala dosa / idli at local messes",
      ],
      packingChecklist: [
        "Light woollens / jacket (even in summer nights)",
        "Comfortable walking shoes",
        "Rain protection (weather can change quickly)",
        "Any personal medicines",
      ],
      safetyTips: [
        "Drive carefully on hairpin bends",
        "Avoid late-night isolated viewpoints",
        "Carry cash + UPI backup (network can fluctuate)",
      ],
      travelerChecklist: [
        "Book return travel before weekend rush",
        "Pre-book toy train if needed",
        "Keep one buffer hour for downhill traffic",
      ],
      organizerChecklist: [
        "Keep 15–20% time buffer between stops for group movement",
        "Confirm driver experienced with Nilgiri ghats",
        "Share meal+washroom stop plan with the group in advance",
      ],
    },
    {
      from: "bangalore",
      to: "coorg",
      distanceKm: 265,
      bestSeason: "October to March",
      idealDuration: "3 to 4 days",
      transportOptions: [
        {
          mode: "Private car",
          duration: "5.5 to 6.5 hours",
          estimatedCost: "₹5,000 to ₹8,500 one way",
          notes: "Best for flexibility around plantations.",
        },
        {
          mode: "Bus",
          duration: "6.5 to 8 hours",
          estimatedCost: "₹450 to ₹1,400",
          notes: "Overnight buses available.",
        },
      ],
      dayWisePlan: [
        {
          day: 1,
          title: "Madikeri orientation",
          activities: ["Raja’s Seat", "Abbey Falls", "Town market"],
        },
        {
          day: 2,
          title: "Nature and coffee trails",
          activities: ["Dubare camp", "Coffee estate walk", "Local cuisine tasting"],
        },
        {
          day: 3,
          title: "Viewpoints and return",
          activities: ["Mandalpatti viewpoint", "Souvenir shopping", "Return"],
        },
      ],
      budget: {
        backpacker: "₹2,800 to ₹4,000 per day",
        comfort: "₹5,000 to ₹7,500 per day",
        premium: "₹10,000+ per day",
      },
      stayRecommendations: ["Madikeri", "Kushalnagar", "Plantation homestays"],
      foodToTry: ["Pandi curry", "Akki rotti", "Fresh filter coffee"],
      packingChecklist: ["Light jacket", "Shoes", "Umbrella"],
      safetyTips: ["Avoid isolated roads at night", "Start early for viewpoints"],
      travelerChecklist: ["Keep digital + physical ID copies"],
      organizerChecklist: ["Group transport and rooming list readiness"],
    },
    {
      from: "chennai",
      to: "pondicherry",
      distanceKm: 155,
      bestSeason: "November to February",
      idealDuration: "2 to 3 days",
      transportOptions: [
        {
          mode: "Car via ECR",
          duration: "3 to 3.5 hours",
          estimatedCost: "₹3,000 to ₹5,000 one way",
          notes: "Scenic coastal drive.",
        },
        {
          mode: "Bus",
          duration: "3.5 to 4.5 hours",
          estimatedCost: "₹220 to ₹850",
          notes: "Frequent government/private buses.",
        },
      ],
      dayWisePlan: [
        {
          day: 1,
          title: "French Quarter walk",
          activities: ["Promenade beach", "Cafes", "Heritage streets"],
        },
        {
          day: 2,
          title: "Auroville and leisure",
          activities: ["Matrimandir visit", "Auro beach", "Sunset"],
        },
      ],
      budget: {
        backpacker: "₹2,500 to ₹3,800 per day",
        comfort: "₹4,500 to ₹6,500 per day",
        premium: "₹9,000+ per day",
      },
      stayRecommendations: ["White Town", "Mission Street", "Auroville side"],
      foodToTry: ["Creole cuisine", "Seafood platters", "Bakeries"],
      packingChecklist: ["Cotton clothes", "Sun protection", "Hydration"],
      safetyTips: ["Stay hydrated", "Carry backup mobile charge"],
      travelerChecklist: ["Pre-book weekend stays"],
      organizerChecklist: ["Restaurant reservations for groups"],
    },
  ],
  majorCities: INDIA_MAJOR_CITIES,
  touristPlaces: INDIA_TOURIST_PLACES,
  statesAndUTs: INDIA_STATES_AND_UTS,
  quickTips: {
    budget:
      "Use a 50-30-20 split for travel budget: 50% stay+transport, 30% food+activities, 20% buffer.",
    packing:
      "Pack by weather + activity: clothing, footwear, medication, travel documents, power backup.",
    permits:
      "Check if destination needs forest permits, e-pass, camera fees, or local entry timings.",
    safety:
      "Share itinerary with family, keep emergency contacts, and avoid late travel on unfamiliar roads.",
  },
};
