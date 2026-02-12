import { Bell, Compass, LogOut, Moon, Search, Sun } from "lucide-react";
import React from "react";
import { LeftNav } from "./LeftNav";
import { BottomNav } from "./BottomNav";
import { DiscoverySnapshot } from "./DiscoverySnapshot";
import { SocialHighlightCard } from "./SocialHighlightCard";
import { TripPlanCard } from "./TripPlanCard";
import { DestinationCard } from "./DestinationCard";
import { SocialFeed } from "../social/SocialFeed";
import { Toaster } from "../ui/sonner";
import { SearchBar } from "./SearchBar";
import { UserProfileModal } from "./UserProfileModal";
import { NotificationsPanel } from "./NotificationsPanel";

interface HomePageProps {
  isDark: boolean;
  toggleTheme: () => void;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export function HomePage({ isDark, toggleTheme, onNavigate, onLogout }: HomePageProps) {
  // Load user data for profile picture
  const [userData, setUserData] = React.useState<any>(null);
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);

  const loadUserData = React.useCallback(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  React.useEffect(() => {
    loadUserData();
    // Listen for profile updates and follow updates
    window.addEventListener('userProfileUpdated', loadUserData);
    window.addEventListener('userFollowUpdated', loadUserData);
    return () => {
      window.removeEventListener('userProfileUpdated', loadUserData);
      window.removeEventListener('userFollowUpdated', loadUserData);
    };
  }, [loadUserData]);

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Mock data
  const socialHighlights = [
    {
      userId: "sarah_travels",
      destination: "Santorini, Greece",
      image: "https://images.unsplash.com/photo-1672622851784-0dbd3df4c088?w=800",
      caption: "Watching the most beautiful sunset over the Aegean Sea. The blue domes and white buildings create such a magical atmosphere!",
    },
    {
      userId: "adventure_mike",
      destination: "Kyoto, Japan",
      image: "https://images.unsplash.com/photo-1732832261520-12cf28c85cda?w=800",
      caption: "Exploring ancient temples and traditional culture. The blend of history and modernity here is absolutely fascinating.",
    },
    {
      userId: "wanderlust_jane",
      destination: "Bali, Indonesia",
      image: "https://images.unsplash.com/photo-1742175257067-414cbe9033ff?w=800",
      caption: "Found this hidden temple surrounded by lush jungle. The peace and serenity here is unmatched.",
    },
  ];

  const upcomingPlans = [
    {
      destination: "Bali, Indonesia",
      image: "https://images.unsplash.com/photo-1742175257067-414cbe9033ff?w=800",
      month: "March 2026",
      category: "Beach",
      organizerName: "Tropical Adventures",
      organizerUserId: "tropical_adv",
    },
    {
      destination: "Paris, France",
      image: "https://images.unsplash.com/photo-1710195778783-a441adf75fda?w=800",
      month: "April 2026",
      category: "City",
      organizerName: "Euro Explorer",
      organizerUserId: "euro_explorer",
    },
    {
      destination: "Maldives",
      image: "https://images.unsplash.com/photo-1614505241498-80a3ec936595?w=800",
      month: "May 2026",
      category: "Beach",
      organizerName: "Island Dreams",
      organizerUserId: "island_dreams",
    },
    {
      destination: "Iceland",
      image: "https://images.unsplash.com/photo-1681834418277-b01c30279693?w=800",
      month: "June 2026",
      category: "Adventure",
      organizerName: "Nordic Explorers",
      organizerUserId: "nordic_exp",
    },
  ];

  const trendingDestinations = [
    {
      name: "Santorini",
      country: "Greece",
      image: "https://images.unsplash.com/photo-1672622851784-0dbd3df4c088?w=600",
      trending: true,
    },
    {
      name: "Kyoto",
      country: "Japan",
      image: "https://images.unsplash.com/photo-1732832261520-12cf28c85cda?w=600",
      trending: true,
    },
    {
      name: "Maldives",
      country: "Maldives",
      image: "https://images.unsplash.com/photo-1614505241498-80a3ec936595?w=600",
      trending: false,
    },
    {
      name: "Iceland",
      country: "Iceland",
      image: "https://images.unsplash.com/photo-1681834418277-b01c30279693?w=600",
      trending: true,
    },
  ];

  const suggestions = [
    { userId: "travel_emma", name: "Emma Wilson" },
    { userId: "nomad_adventures", name: "Nomad Adventures", isOrganizer: true },
    { userId: "alex_explorer", name: "Alex Chen" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Left Navigation */}
      <LeftNav activePage="home" onNavigate={onNavigate} />

      {/* Top Navigation Bar */}
      <div className="lg:ml-64 fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-40">
        <div className="flex items-center justify-between h-16 px-4 lg:px-8">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <Compass className="size-6 text-teal-500" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Trip Mate
            </span>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:block flex-1 max-w-lg">
            <SearchBar onUserSelect={(userId) => setSelectedUserId(userId)} />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isDark ? (
                <Sun className="size-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <Moon className="size-5 text-slate-600 dark:text-slate-400" />
              )}
            </button>
            <NotificationsPanel onUserSelect={(userId) => setSelectedUserId(userId)} />
            <button
              onClick={onLogout}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
              title="Logout"
            >
              <LogOut className="size-5 text-slate-600 dark:text-slate-400 group-hover:text-red-500" />
            </button>
            <div
              onClick={() => onNavigate("profile")}
              className="size-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-teal-500 transition-all overflow-hidden"
              style={userData?.profilePicture ? {
                backgroundImage: `url(${userData.profilePicture})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              } : {}}
            >
              {!userData?.profilePicture && (
                <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">
                  {userData?.userId?.charAt(0).toUpperCase() || 'S'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Mobile Search Bar */}
          <div className="lg:hidden mb-4 pt-4">
            <SearchBar onUserSelect={(userId) => setSelectedUserId(userId)} />
          </div>

          {/* Personalized Greeting */}
          <div className="py-8 space-y-1">
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {getGreeting()}, <span className="text-slate-900 dark:text-white font-medium">{userData?.fullName || 'Traveler'}</span>
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Here's what's new in travel today
            </p>
          </div>

          {/* Discovery Snapshot */}
          <section className="mb-12">
            <DiscoverySnapshot />
          </section>

          {/* Social Highlights Section - Above Feed */}
          <section className="mb-12">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                Recent travel stories
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                From people you follow
              </p>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
              {socialHighlights.map((highlight, index) => (
                <SocialHighlightCard key={index} {...highlight} />
              ))}
            </div>
          </section>

          {/* Two Column Layout on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Feed - Left Column (2/3 width on desktop) */}
            <div className="lg:col-span-2">
              {/* Social Feed Section */}
              <section>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                    Social Feed
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Latest posts from your network
                  </p>
                </div>
                <SocialFeed />
              </section>
            </div>

            {/* Sidebar - Right Column (1/3 width on desktop) */}
            <div className="space-y-12">
              {/* Upcoming Plans Section */}
              <section>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                      Upcoming plans
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Featured trips
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {upcomingPlans.slice(0, 3).map((plan, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="aspect-video relative">
                        <img
                          src={plan.image}
                          alt={plan.destination}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                          {plan.destination}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {plan.month} • {plan.category}
                        </p>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => onNavigate("trips")}
                    className="w-full py-2 text-sm text-teal-500 hover:text-teal-600 font-medium"
                  >
                    View all trips →
                  </button>
                </div>
              </section>

              {/* Suggestions Section */}
              <section>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                    Suggestions for you
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Connect with travelers
                  </p>
                </div>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`size-10 rounded-full ${
                            suggestion.isOrganizer
                              ? "bg-teal-100 dark:bg-teal-950"
                              : "bg-slate-200 dark:bg-slate-700"
                          } flex items-center justify-center flex-shrink-0`}
                        >
                          <span
                            className={`text-sm font-medium ${
                              suggestion.isOrganizer
                                ? "text-teal-600 dark:text-teal-400"
                                : "text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {suggestion.userId.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                            {suggestion.userId}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {suggestion.name}
                          </p>
                        </div>
                      </div>
                      <button className="w-full px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm rounded-lg font-medium transition-colors">
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Trending Destinations Section */}
              <section>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                    Trending destinations
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Popular this week
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {trendingDestinations.map((destination, index) => (
                    <DestinationCard key={index} {...destination} />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav activePage="home" onNavigate={onNavigate} />
      
      {/* User Profile Modal */}
      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
      
      <Toaster />
    </div>
  );
}