import { useState } from "react";
import { LeftNav } from "../home/LeftNav";
import { TopBar } from "../home/TopBar";
import { BottomNav } from "../home/BottomNav";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin, 
  Users, 
  TrendingUp,
  Check,
  X as XIcon,
  ChevronDown,
  ChevronUp,
  Star,
  Shield,
  Info
} from "lucide-react";
import { Trip } from "./TripsPage";

interface TripDetailPageProps {
  trip: Trip;
  isDark: boolean;
  toggleTheme: () => void;
  onNavigate: (page: string) => void;
  onBack: () => void;
}

// Extended trip data for detail view
interface DayItinerary {
  day: number;
  title: string;
  description: string;
}

const mockItinerary: Record<number, DayItinerary[]> = {
  1: [
    { day: 1, title: "Arrival & Temple Introduction", description: "Arrive in Kyoto, check into accommodation, and enjoy a welcome dinner. Evening orientation about Japanese temple culture and etiquette." },
    { day: 2, title: "Kinkaku-ji & Ryoan-ji", description: "Visit the Golden Pavilion and zen rock garden. Learn about Buddhist architecture and meditation practices." },
    { day: 3, title: "Fushimi Inari Shrine", description: "Explore the famous thousand torii gates. Hike through the mountain trails and discover hidden shrines." },
    { day: 4, title: "Arashiyama Bamboo Grove", description: "Walk through bamboo forests, visit Tenryu-ji Temple, and explore the scenic Togetsukyo Bridge area." },
    { day: 5, title: "Departure Day", description: "Final morning tea ceremony experience and transfer to airport." }
  ],
  2: [
    { day: 1, title: "Arrival in Santorini", description: "Airport pickup and transfer to hotel. Evening sunset viewing from Oia village." },
    { day: 2, title: "Fira & Caldera Tour", description: "Explore the capital town, visit the Archaeological Museum, and take a boat tour of the caldera." },
    { day: 3, title: "Beach Day at Red Beach", description: "Relax at the unique red sand beach, swimming and sunbathing. Evening wine tasting at local vineyard." },
    { day: 4, title: "Village Exploration", description: "Visit traditional villages of Pyrgos and Megalochori. Discover local cuisine and architecture." },
    { day: 5, title: "Volcano & Hot Springs", description: "Boat trip to volcanic islands, swim in natural hot springs." },
    { day: 6, title: "Free Day", description: "Leisure time for shopping, relaxing, or optional activities." },
    { day: 7, title: "Departure", description: "Sunrise viewing and transfer to airport." }
  ]
};

const mockInclusions = [
  "Accommodation for entire duration",
  "Daily breakfast and selected meals",
  "All entrance fees to attractions",
  "Professional tour guide",
  "Airport transfers",
  "Travel insurance coverage"
];

const mockExclusions = [
  "International flights",
  "Personal expenses and shopping",
  "Optional activities not in itinerary",
  "Alcoholic beverages",
  "Tips and gratuities"
];

const mockReviews = [
  { name: "Sarah Johnson", rating: 5, date: "Jan 2026", comment: "An incredible experience! The organizer was professional and knowledgeable. Highly recommend." },
  { name: "Michael Chen", rating: 4, date: "Dec 2025", comment: "Great trip overall. Well organized and the itinerary was perfect for our group." },
  { name: "Emma Wilson", rating: 5, date: "Nov 2025", comment: "Best travel experience I've had. Every detail was taken care of professionally." }
];

export function TripDetailPage({ trip, isDark, toggleTheme, onNavigate, onBack }: TripDetailPageProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  
  // Get itinerary for this trip (use trip 1 as default if not found)
  const itinerary = mockItinerary[trip.id] || mockItinerary[1] || [];

  const toggleDay = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Left Navigation */}
      <LeftNav activePage="trips" onNavigate={onNavigate} />

      {/* Top Bar */}
      <TopBar isDark={isDark} toggleTheme={toggleTheme} />

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 pb-16 lg:pb-6">
        {/* Back Navigation */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="size-5" />
              <span>Back to Trips</span>
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6 relative">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Hero Section */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 mb-6">
                <div className="aspect-[21/9] relative overflow-hidden">
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-teal-500 text-white text-sm rounded-full">
                        {trip.category}
                      </span>
                      <span className="px-3 py-1 bg-white/90 text-slate-900 text-sm rounded-full">
                        {trip.difficulty}
                      </span>
                    </div>
                    <h1 className="text-3xl font-semibold text-white mb-2">
                      {trip.title}
                    </h1>
                    <p className="text-white/90 flex items-center gap-2">
                      <MapPin className="size-4" />
                      {trip.destination}, {trip.country}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Summary */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  At a Glance
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-teal-50 dark:bg-teal-950/30 rounded-lg">
                      <Clock className="size-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Duration</p>
                      <p className="font-medium text-slate-900 dark:text-white">{trip.duration} days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-teal-50 dark:bg-teal-950/30 rounded-lg">
                      <DollarSign className="size-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Budget</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        ${trip.budgetMin}-${trip.budgetMax}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-teal-50 dark:bg-teal-950/30 rounded-lg">
                      <TrendingUp className="size-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Difficulty</p>
                      <p className="font-medium text-slate-900 dark:text-white">{trip.difficulty}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-teal-50 dark:bg-teal-950/30 rounded-lg">
                      <Users className="size-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Group Size</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {trip.availableSpots}/{trip.totalSpots} spots
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="size-4" />
                    <span className="text-sm">
                      {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Organizer Information */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Trip Organizer
                </h2>
                <div className="flex items-start gap-4">
                  <div className="size-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
                    {trip.organizerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      {trip.organizerName}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="size-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-slate-900 dark:text-white">{trip.organizerRating}</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">• Professional Travel Organizer</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Experienced in organizing cultural and adventure trips across Asia. Committed to providing authentic travel experiences with local insights.
                    </p>
                    <button className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium">
                      View Organizer Profile →
                    </button>
                  </div>
                </div>
              </div>

              {/* Trip Description */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  About This Trip
                </h2>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                    Experience the serene beauty and rich cultural heritage of {trip.destination}. This carefully curated journey takes you through ancient temples, traditional neighborhoods, and hidden gems that showcase the authentic spirit of the region.
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                    Perfect for travelers who appreciate cultural immersion and mindful exploration. Our small group approach ensures personalized attention and meaningful connections with local communities.
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    Whether you're a solo traveler, couple, or small group of friends, this trip offers the perfect balance of guided experiences and free time to explore at your own pace.
                  </p>
                </div>
              </div>

              {/* Day-wise Itinerary */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Day-by-Day Itinerary
                </h2>
                <div className="space-y-3">
                  {itinerary.map((day) => (
                    <div
                      key={day.day}
                      className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleDay(day.day)}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center">
                            <span className="font-semibold text-teal-600 dark:text-teal-400">
                              {day.day}
                            </span>
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium text-slate-900 dark:text-white">
                              {day.title}
                            </h3>
                          </div>
                        </div>
                        {expandedDay === day.day ? (
                          <ChevronUp className="size-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="size-5 text-slate-400" />
                        )}
                      </button>
                      {expandedDay === day.day && (
                        <div className="px-4 pb-4 pt-0">
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed pl-13">
                            {day.description}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  What's Included & Excluded
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Inclusions */}
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Check className="size-5 text-teal-600 dark:text-teal-400" />
                      Included
                    </h3>
                    <ul className="space-y-2">
                      {mockInclusions.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <Check className="size-4 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Exclusions */}
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <XIcon className="size-5 text-slate-400" />
                      Not Included
                    </h3>
                    <ul className="space-y-2">
                      {mockExclusions.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <XIcon className="size-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Policies */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="size-5 text-teal-600 dark:text-teal-400" />
                  Policies & Important Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                      Cancellation Policy
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Free cancellation up to 30 days before departure. 50% refund for cancellations made 15-30 days before departure. No refund for cancellations made less than 15 days before departure.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                      Requirements
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Valid passport required. Travel insurance highly recommended. Moderate fitness level required for walking activities.
                    </p>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/30">
                    <Info className="size-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-900 dark:text-amber-200">
                      Trip is subject to minimum group size of 6 participants. We will notify you at least 14 days prior if trip needs to be rescheduled.
                    </p>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Reviews & Ratings
                  </h2>
                  <button className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium">
                    View All Reviews
                  </button>
                </div>
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="text-center">
                    <div className="text-4xl font-semibold text-slate-900 dark:text-white">
                      {trip.organizerRating}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${
                            i < Math.floor(trip.organizerRating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300 dark:text-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Based on 48 reviews
                    </p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400 w-8">
                          {rating}★
                        </span>
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400"
                            style={{ width: `${rating === 5 ? 75 : rating === 4 ? 20 : 5}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  {mockReviews.map((review, index) => (
                    <div key={index} className="border-b border-slate-200 dark:border-slate-800 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">
                            {review.name}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {review.date}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Booking Card (Desktop) */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-20">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <div className="mb-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Price per person
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-semibold text-slate-900 dark:text-white">
                        ${trip.budgetMin}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        - ${trip.budgetMax}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Available Spots</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {trip.availableSpots} of {trip.totalSpots}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Start Date</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <button className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium transition-colors mb-3">
                    Book This Trip
                  </button>
                  
                  <p className="text-xs text-center text-slate-600 dark:text-slate-400">
                    Free cancellation up to 30 days before departure
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Booking Bar */}
        <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 z-40">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">From</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                ${trip.budgetMin}
              </p>
            </div>
            <button className="flex-1 py-3 px-6 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium transition-colors">
              Book This Trip
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav activePage="trips" onNavigate={onNavigate} />
    </div>
  );
}
