import { useState, useEffect } from "react";
import { LeftNav } from "../home/LeftNav";
import { TopBar } from "../home/TopBar";
import { BottomNav } from "../home/BottomNav";
import { FiltersPanel } from "./FiltersPanel";
import { TripCard } from "./TripCard";
import { SlidersHorizontal, X } from "lucide-react";

interface TripsPageProps {
  isDark: boolean;
  toggleTheme: () => void;
  onNavigate: (page: string) => void;
  onViewTripDetail?: (trip: Trip) => void;
}

export interface TripFilters {
  destination: string;
  category: string[];
  budgetRange: [number, number];
  duration: string;
  dateRange: string;
  difficulty: string;
  organizerRating: number;
}

export interface Trip {
  id: number;
  title: string;
  destination: string;
  country: string;
  category: string;
  duration: number;
  budgetMin: number;
  budgetMax: number;
  organizerId: string;
  organizerName: string;
  organizerRating: number;
  startDate: string;
  endDate: string;
  image: string;
  difficulty: string;
  availableSpots: number;
  totalSpots: number;
}

// Mock trips data
const mockTrips: Trip[] = [
  {
    id: 1,
    title: "Kyoto Temple Discovery",
    destination: "Kyoto",
    country: "Japan",
    category: "Cultural",
    duration: 5,
    budgetMin: 1200,
    budgetMax: 1500,
    organizerId: "nomad_adventures",
    organizerName: "Nomad Adventures",
    organizerRating: 4.8,
    startDate: "2026-03-15",
    endDate: "2026-03-20",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600",
    difficulty: "Easy",
    availableSpots: 8,
    totalSpots: 12
  },
  {
    id: 2,
    title: "Santorini Sunset Experience",
    destination: "Santorini",
    country: "Greece",
    category: "Beach",
    duration: 7,
    budgetMin: 1800,
    budgetMax: 2200,
    organizerId: "greek_explorers",
    organizerName: "Greek Explorers",
    organizerRating: 4.9,
    startDate: "2026-04-10",
    endDate: "2026-04-17",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600",
    difficulty: "Easy",
    availableSpots: 5,
    totalSpots: 10
  },
  {
    id: 3,
    title: "Himalayan Trekking Adventure",
    destination: "Kathmandu",
    country: "Nepal",
    category: "Adventure",
    duration: 10,
    budgetMin: 2500,
    budgetMax: 3000,
    organizerId: "mountain_guides",
    organizerName: "Mountain Guides Nepal",
    organizerRating: 4.7,
    startDate: "2026-05-01",
    endDate: "2026-05-11",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600",
    difficulty: "Challenging",
    availableSpots: 6,
    totalSpots: 8
  },
  {
    id: 4,
    title: "Marrakech Souks & Culture",
    destination: "Marrakech",
    country: "Morocco",
    category: "Cultural",
    duration: 6,
    budgetMin: 1000,
    budgetMax: 1400,
    organizerId: "sahara_journeys",
    organizerName: "Sahara Journeys",
    organizerRating: 4.6,
    startDate: "2026-03-22",
    endDate: "2026-03-28",
    image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=600",
    difficulty: "Easy",
    availableSpots: 10,
    totalSpots: 15
  },
  {
    id: 5,
    title: "Iceland Northern Lights",
    destination: "Reykjavik",
    country: "Iceland",
    category: "Adventure",
    duration: 8,
    budgetMin: 3000,
    budgetMax: 3500,
    organizerId: "arctic_adventures",
    organizerName: "Arctic Adventures",
    organizerRating: 4.9,
    startDate: "2026-02-15",
    endDate: "2026-02-23",
    image: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=600",
    difficulty: "Moderate",
    availableSpots: 4,
    totalSpots: 12
  },
  {
    id: 6,
    title: "Bali Yoga & Wellness Retreat",
    destination: "Ubud",
    country: "Indonesia",
    category: "Wellness",
    duration: 7,
    budgetMin: 1500,
    budgetMax: 1900,
    organizerId: "bali_wellness",
    organizerName: "Bali Wellness Co.",
    organizerRating: 4.8,
    startDate: "2026-04-05",
    endDate: "2026-04-12",
    image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=600",
    difficulty: "Easy",
    availableSpots: 7,
    totalSpots: 10
  },
  {
    id: 7,
    title: "Swiss Alps Hiking",
    destination: "Interlaken",
    country: "Switzerland",
    category: "Hills",
    duration: 9,
    budgetMin: 2800,
    budgetMax: 3200,
    organizerId: "alpine_trails",
    organizerName: "Alpine Trails",
    organizerRating: 4.7,
    startDate: "2026-06-20",
    endDate: "2026-06-29",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600",
    difficulty: "Moderate",
    availableSpots: 9,
    totalSpots: 12
  },
  {
    id: 8,
    title: "Vietnamese Culinary Journey",
    destination: "Hanoi",
    country: "Vietnam",
    category: "Food & Culture",
    duration: 7,
    budgetMin: 900,
    budgetMax: 1200,
    organizerId: "nomad_adventures",
    organizerName: "Nomad Adventures",
    organizerRating: 4.8,
    startDate: "2026-03-28",
    endDate: "2026-04-04",
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600",
    difficulty: "Easy",
    availableSpots: 6,
    totalSpots: 10
  },
  {
    id: 9,
    title: "Peru Machu Picchu Trek",
    destination: "Cusco",
    country: "Peru",
    category: "Adventure",
    duration: 12,
    budgetMin: 3500,
    budgetMax: 4000,
    organizerId: "andean_trails",
    organizerName: "Andean Trails",
    organizerRating: 4.9,
    startDate: "2026-05-15",
    endDate: "2026-05-27",
    image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=600",
    difficulty: "Challenging",
    availableSpots: 3,
    totalSpots: 8
  },
  {
    id: 10,
    title: "Italian Coastal Discovery",
    destination: "Amalfi Coast",
    country: "Italy",
    category: "Beach",
    duration: 6,
    budgetMin: 2000,
    budgetMax: 2400,
    organizerId: "italian_escapes",
    organizerName: "Italian Escapes",
    organizerRating: 4.7,
    startDate: "2026-05-08",
    endDate: "2026-05-14",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600",
    difficulty: "Easy",
    availableSpots: 8,
    totalSpots: 12
  },
  {
    id: 11,
    title: "African Safari Experience",
    destination: "Serengeti",
    country: "Tanzania",
    category: "Wildlife",
    duration: 8,
    budgetMin: 4000,
    budgetMax: 5000,
    organizerId: "safari_experts",
    organizerName: "Safari Experts",
    organizerRating: 4.9,
    startDate: "2026-07-10",
    endDate: "2026-07-18",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600",
    difficulty: "Moderate",
    availableSpots: 5,
    totalSpots: 10
  },
  {
    id: 12,
    title: "New Zealand Adventure",
    destination: "Queenstown",
    country: "New Zealand",
    category: "Adventure",
    duration: 14,
    budgetMin: 4500,
    budgetMax: 5500,
    organizerId: "kiwi_adventures",
    organizerName: "Kiwi Adventures",
    organizerRating: 4.8,
    startDate: "2026-08-01",
    endDate: "2026-08-15",
    image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=600",
    difficulty: "Moderate",
    availableSpots: 7,
    totalSpots: 12
  }
];

export function TripsPage({ isDark, toggleTheme, onNavigate, onViewTripDetail }: TripsPageProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allTrips, setAllTrips] = useState<Trip[]>(mockTrips);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<TripFilters>({
    destination: "",
    category: [],
    budgetRange: [0, 10000],
    duration: "",
    dateRange: "",
    difficulty: "",
    organizerRating: 0
  });

  useEffect(() => {
    fetchTripsFromBackend();
  }, []);

  const fetchTripsFromBackend = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/trips');
      if (response.ok) {
        const data = await response.json();
        // Transform backend trips to match frontend Trip interface
        const backendTrips = data.data.trips.map((trip: any, index: number) => {
          const startDate = new Date(trip.startDate);
          const endDate = new Date(trip.endDate);
          const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            id: 1000 + index, // Offset IDs to avoid conflicts with mock data
            title: trip.title,
            destination: trip.destination,
            country: trip.country,
            category: trip.category,
            duration: duration,
            budgetMin: trip.priceMin,
            budgetMax: trip.priceMax,
            organizerId: trip.organizer.userId,
            organizerName: trip.organizer.fullName,
            organizerRating: 4.5, // Default rating
            startDate: trip.startDate,
            endDate: trip.endDate,
            image: trip.coverImage,
            difficulty: trip.difficulty,
            availableSpots: trip.availableSpots,
            totalSpots: trip.totalSpots
          };
        });
        // Merge backend trips with mock trips
        setAllTrips([...mockTrips, ...backendTrips]);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      // Keep mock data if fetch fails
    } finally {
      setIsLoading(false);
    }
  };

  const tripsPerPage = 9;

  // Filter trips based on current filters
  const filteredTrips = allTrips.filter(trip => {
    // Destination filter
    if (filters.destination && !trip.destination.toLowerCase().includes(filters.destination.toLowerCase()) && !trip.country.toLowerCase().includes(filters.destination.toLowerCase())) {
      return false;
    }

    // Category filter
    if (filters.category.length > 0 && !filters.category.includes(trip.category)) {
      return false;
    }

    // Budget filter
    if (trip.budgetMin > filters.budgetRange[1] || trip.budgetMax < filters.budgetRange[0]) {
      return false;
    }

    // Duration filter
    if (filters.duration) {
      const durationNum = parseInt(filters.duration);
      if (filters.duration.includes('+')) {
        if (trip.duration < durationNum) return false;
      } else if (filters.duration.includes('-')) {
        const [min, max] = filters.duration.split('-').map(d => parseInt(d));
        if (trip.duration < min || trip.duration > max) return false;
      }
    }

    // Difficulty filter
    if (filters.difficulty && trip.difficulty !== filters.difficulty) {
      return false;
    }

    // Organizer rating filter
    if (filters.organizerRating > 0 && trip.organizerRating < filters.organizerRating) {
      return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTrips.length / tripsPerPage);
  const startIndex = (currentPage - 1) * tripsPerPage;
  const endIndex = startIndex + tripsPerPage;
  const currentTrips = filteredTrips.slice(startIndex, endIndex);

  // Get recommended trips (top-rated trips from filtered results, limit to 5)
  const recommendedTrips = filteredTrips
    .sort((a, b) => b.organizerRating - a.organizerRating)
    .slice(0, 5);

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters: TripFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      destination: "",
      category: [],
      budgetRange: [0, 10000],
      duration: "",
      dateRange: "",
      difficulty: "",
      organizerRating: 0
    });
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Left Navigation */}
      <LeftNav activePage="trips" onNavigate={onNavigate} />

      {/* Top Bar */}
      <TopBar isDark={isDark} toggleTheme={toggleTheme} />

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 pb-16 lg:pb-6">
        {/* Page Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white mb-2">
              Explore Trips
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
              Discover travel plans that match your interests, budget, and schedule.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6">
            {/* Desktop Filters Panel */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-20">
                <FiltersPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onReset={handleResetFilters}
                />
              </div>
            </div>

            {/* Trip Results */}
            <div className="flex-1 min-w-0">
              {/* Mobile Filter Button */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <SlidersHorizontal className="size-5" />
                  <span>Filters</span>
                  {(filters.category.length > 0 || filters.destination || filters.difficulty || filters.organizerRating > 0) && (
                    <span className="ml-2 px-2 py-0.5 bg-teal-500 text-white text-xs rounded-full">
                      Active
                    </span>
                  )}
                </button>
              </div>

              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-slate-600 dark:text-slate-400">
                  {filteredTrips.length} {filteredTrips.length === 1 ? 'trip' : 'trips'} found
                </p>
                {(filters.category.length > 0 || filters.destination || filters.difficulty || filters.organizerRating > 0) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              {/* Recommended Section */}
              {recommendedTrips.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                        Recommended for you
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Based on your preferences and selected filters
                      </p>
                    </div>
                  </div>
                  
                  {/* Horizontal Scrollable Row */}
                  <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                    <div className="flex gap-6 pb-2">
                      {recommendedTrips.map(trip => (
                        <div key={trip.id} className="w-80 flex-shrink-0">
                          <TripCard trip={trip} onViewDetails={onViewTripDetail} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* All Trips Section */}
              {currentTrips.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    All Trips
                  </h2>
                </div>
              )}

              {/* Trip Cards Grid */}
              {currentTrips.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {currentTrips.map(trip => (
                      <TripCard key={trip.id} trip={trip} onViewDetails={onViewTripDetail} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`size-10 rounded-lg font-medium transition-colors ${
                              currentPage === i + 1
                                ? "bg-teal-500 text-white"
                                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                // Empty State
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
                  <div className="size-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <SlidersHorizontal className="size-10 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    No trips match your filters
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    Try adjusting your search criteria or clearing some filters to see more results.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />

          {/* Modal */}
          <div className="absolute inset-x-0 bottom-0 top-16 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Filters
                </h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="size-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <FiltersPanel
                filters={filters}
                onFilterChange={(newFilters) => {
                  handleFilterChange(newFilters);
                  setShowMobileFilters(false);
                }}
                onReset={() => {
                  handleResetFilters();
                  setShowMobileFilters(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation (Mobile) */}
      <BottomNav activePage="trips" onNavigate={onNavigate} />
    </div>
  );
}