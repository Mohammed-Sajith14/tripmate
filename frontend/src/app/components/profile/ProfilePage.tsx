import { useState, useEffect } from "react";
import { LeftNav } from "../home/LeftNav";
import { TopBar } from "../home/TopBar";
import { BottomNav } from "../home/BottomNav";
import { 
  Edit, 
  MapPin, 
  Calendar, 
  Star, 
  Bookmark,
  Users,
  Briefcase,
  Globe
} from "lucide-react";
import { EditProfileModal } from "./EditProfileModal";
import { Toaster } from "../ui/sonner";

interface ProfilePageProps {
  isDark: boolean;
  toggleTheme: () => void;
  onNavigate: (page: string) => void;
  userType?: "traveler" | "organizer";
}

// Mock data - empty for new users
const mockTravelerData = {
  userId: "",
  fullName: "",
  role: "Traveler",
  bio: "",
  stats: {
    tripsBooked: 0,
    placesExplored: 0,
    reviewsWritten: 0,
    followers: 0,
    following: 0
  },
  travelActivity: [],
  reviews: [],
  saved: []
};

const mockOrganizerData = {
  userId: "",
  fullName: "",
  role: "Organizer",
  bio: "",
  organizationName: "",
  organizationLocation: "",
  organizationDescription: "",
  stats: {
    tripsCreated: 0,
    followers: 0,
    bookingRate: 0,
    averageRating: 0
  },
  publishedTrips: [],
  travelActivity: [],
  reviews: [],
  saved: []
};

export function ProfilePage({
  isDark,
  toggleTheme,
  onNavigate,
  userType = "traveler",
}: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<"activity" | "reviews" | "saved">("activity");
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUserType, setCurrentUserType] = useState<"traveler" | "organizer">(userType);
  const [realUserData, setRealUserData] = useState<any>(null);

  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadUserData = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setRealUserData(user);
          setCurrentUserType(user.role);
          console.log('Loaded user from localStorage:', user);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };

    loadUserData();

    // Listen for profile update events
    window.addEventListener('userProfileUpdated', loadUserData);
    return () => window.removeEventListener('userProfileUpdated', loadUserData);
  }, []);

  // Merge real user data with mock data for display
  const userData = realUserData ? {
    ...(currentUserType === "organizer" ? mockOrganizerData : mockTravelerData),
    userId: realUserData.userId,
    fullName: realUserData.fullName,
    email: realUserData.email,
    profilePicture: realUserData.profilePicture,
    role: realUserData.role === 'traveler' ? 'Traveler' : 'Organizer',
    bio: realUserData.bio || (currentUserType === "organizer" ? mockOrganizerData.bio : mockTravelerData.bio),
    organizationName: realUserData.organizationName || mockOrganizerData.organizationName,
    organizationLocation: realUserData.organizationLocation || mockOrganizerData.organizationLocation,
    organizationDescription: realUserData.organizationDescription || mockOrganizerData.organizationDescription,
    stats: {
      ...(currentUserType === "organizer" ? mockOrganizerData.stats : mockTravelerData.stats),
      followers: realUserData.followersCount || 0,
      following: realUserData.followingCount || 0,
    }
  } : (currentUserType === "organizer" ? mockOrganizerData : mockTravelerData);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Left Navigation */}
      <LeftNav activePage="profile" onNavigate={onNavigate} />

      {/* Top Bar */}
      <TopBar isDark={isDark} toggleTheme={toggleTheme} />

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 pb-16 lg:pb-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Demo Toggle (Remove in production) */}
          <div className="p-4 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-900 rounded-xl">
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              <strong>Demo Mode:</strong> Toggle between user types to see different profile layouts
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentUserType("traveler")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentUserType === "traveler"
                    ? "bg-teal-500 text-white shadow-lg"
                    : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                }`}
              >
                Traveler Profile
              </button>
              <button
                onClick={() => setCurrentUserType("organizer")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentUserType === "organizer"
                    ? "bg-teal-500 text-white shadow-lg"
                    : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                }`}
              >
                Organizer Profile
              </button>
            </div>
          </div>

          {/* Profile Header Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Profile Picture */}
              <div 
                className="size-24 sm:size-28 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={
                  userData.profilePicture
                    ? {
                        backgroundImage: `url(${userData.profilePicture})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : {}
                }
              >
                {!userData.profilePicture && (
                  <span className="text-3xl font-bold text-white">
                    {userData.userId.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mb-1">
                      {userData.userId}
                    </h1>
                    <p className="text-base text-slate-900 dark:text-white mb-1">
                      {userData.fullName}
                    </p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {userData.role}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg transition-colors"
                  >
                    <Edit className="size-4" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">About</h2>
              <button
                onClick={() => setShowEditModal(true)}
                className="text-sm text-teal-500 hover:text-teal-600 font-medium"
              >
                Edit
              </button>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {userData.bio}
            </p>
          </div>

          {/* Organizer-Specific: Organization Details */}
          {currentUserType === "organizer" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Organization Details</h2>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="text-sm text-teal-500 hover:text-teal-600 font-medium"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Briefcase className="size-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Organization Name</p>
                    <p className="text-slate-900 dark:text-white">{userData.organizationName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="size-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Location</p>
                    <p className="text-slate-900 dark:text-white">{userData.organizationLocation}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="size-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Description</p>
                    <p className="text-slate-900 dark:text-white">{userData.organizationDescription}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Travel Summary Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
              {currentUserType === "organizer" ? "Community" : "Travel Summary"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6">
              {currentUserType === "traveler" && (
                <>
                  <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-2xl font-semibold text-slate-900 dark:text-white mb-1">
                      {userData.stats.tripsBooked}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Trips Booked</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-2xl font-semibold text-slate-900 dark:text-white mb-1">
                      {userData.stats.placesExplored}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Places Explored</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-2xl font-semibold text-slate-900 dark:text-white mb-1">
                      {userData.stats.reviewsWritten}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Reviews Written</p>
                  </div>
                </>
              )}
              <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-2xl font-semibold text-slate-900 dark:text-white mb-1">
                  {userData.stats.followers}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Followers</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-2xl font-semibold text-slate-900 dark:text-white mb-1">
                  {userData.stats.following}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Following</p>
              </div>
            </div>
          </div>

          {/* Organizer-Specific: Published Trips Summary */}
          {currentUserType === "organizer" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Published Trips</h2>
              <div className="space-y-4">
                {userData.publishedTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 mb-3 sm:mb-0">
                      <h3 className="font-medium text-slate-900 dark:text-white mb-1">{trip.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-4" />
                          {trip.destination}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="size-4" />
                          {trip.duration}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs">
                          {trip.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {trip.bookings} bookings
                        </p>
                        <span
                          className={`text-xs ${
                            trip.status === "Upcoming"
                              ? "text-teal-600 dark:text-teal-400"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {trip.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Sections (Tabbed) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveTab("activity")}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  activeTab === "activity"
                    ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Travel Activity
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  activeTab === "reviews"
                    ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Reviews
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  activeTab === "saved"
                    ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Saved
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 sm:p-8">
              {/* Travel Activity Tab */}
              {activeTab === "activity" && (
                <div className="space-y-4">
                  {currentUserType === "traveler" && userData.travelActivity.length > 0 ? (
                    userData.travelActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
                      >
                        <img
                          src={activity.image}
                          alt={activity.destination}
                          className="size-20 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                            {activity.destination}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                            {activity.country}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Calendar className="size-4" />
                            <span>{activity.date}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MapPin className="size-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                      <p className="text-slate-500 dark:text-slate-400">
                        {currentUserType === "organizer"
                          ? "Travel activity is not available for organizer profiles"
                          : "No travel activity yet"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div className="space-y-4">
                  {currentUserType === "traveler" && userData.reviews.length > 0 ? (
                    userData.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                              {review.destination}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              by @{review.organizer}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`size-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-slate-300 dark:text-slate-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 mb-2">{review.text}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{review.date}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Star className="size-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                      <p className="text-slate-500 dark:text-slate-400">
                        {currentUserType === "organizer"
                          ? "Reviews are not available for organizer profiles"
                          : "No reviews written yet"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Saved Tab */}
              {activeTab === "saved" && (
                <div>
                  {currentUserType === "traveler" && userData.saved.length > 0 ? (
                    <div className="space-y-4">
                      {userData.saved.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
                        >
                          <img
                            src={item.image}
                            alt={item.destination}
                            className="size-20 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                              {item.destination}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              by @{item.organizer}
                            </p>
                          </div>
                          <button className="text-teal-500 hover:text-teal-600">
                            <Bookmark className="size-5 fill-current" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Bookmark className="size-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                      <p className="text-slate-500 dark:text-slate-400">
                        {currentUserType === "organizer"
                          ? "Saved items are not available for organizer profiles"
                          : "No saved destinations yet"}
                      </p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                        Only you can see what you've saved
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav activePage="profile" onNavigate={onNavigate} />

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          userData={userData}
          userType={currentUserType}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Toaster */}
      <Toaster />
    </div>
  );
}