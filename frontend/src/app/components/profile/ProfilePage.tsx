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
  Briefcase,
  Globe,
  Trash2,
  Pencil,
  Save,
  XCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { EditProfileModal } from "./EditProfileModal";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Toaster } from "../ui/sonner";
import { toast } from "sonner";

interface ProfilePageProps {
  isDark: boolean;
  toggleTheme: () => void;
  onNavigate: (page: string) => void;
  userType?: "traveler" | "organizer";
}

interface TravelerPost {
  id: string;
  content: string;
  location: string;
  images: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

interface OrganizerTrip {
  id: string;
  title: string;
  destination: string;
  country: string;
  location: string;
  category: string;
  startDate: string;
  endDate: string;
  priceMin: number;
  priceMax: number;
  totalSpots: number;
  availableSpots: number;
  description: string;
  coverImage: string;
  bookingsCount: number;
  bookings: OrganizerTripBooking[];
}

interface OrganizerTripBooking {
  id: string;
  fullName: string;
  age: number | null;
  gender: string;
  phoneNumber: string;
  email: string;
  idProofImage: string;
  bookedAt: string;
  priceAtBooking: number;
  travelerName: string;
  travelerEmail: string;
}

interface OrganizerReviewItem {
  _id: string;
  reviewerUserIdSnapshot: string;
  trip?: {
    title?: string;
    destination?: string;
  };
  organizerReview: {
    rating: number;
    text: string;
  };
  createdAt: string;
}

interface TripEditForm {
  title: string;
  destination: string;
  country: string;
  location: string;
  category: string;
  startDate: string;
  endDate: string;
  priceMin: string;
  priceMax: string;
  totalSpots: string;
  description: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
};

const formatDateInputValue = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

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
  const [travelerPosts, setTravelerPosts] = useState<TravelerPost[]>([]);
  const [organizerTrips, setOrganizerTrips] = useState<OrganizerTrip[]>([]);
  const [isProfileContentLoading, setIsProfileContentLoading] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [tripEditForm, setTripEditForm] = useState<TripEditForm | null>(null);
  const [isSavingTrip, setIsSavingTrip] = useState(false);
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [isLoadingLocationSuggestions, setIsLoadingLocationSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [organizerReviews, setOrganizerReviews] = useState<OrganizerReviewItem[]>([]);

  const mapTravelerPost = (post: any): TravelerPost => ({
    id: post?._id || "",
    content: post?.content || "",
    location: post?.location || "",
    images: Array.isArray(post?.images) ? post.images : [],
    likesCount: typeof post?.likesCount === "number" ? post.likesCount : 0,
    commentsCount: typeof post?.commentsCount === "number" ? post.commentsCount : 0,
    createdAt: post?.createdAt || new Date().toISOString(),
  });

  const mapOrganizerTrip = (trip: any): OrganizerTrip => ({
    id: trip?._id || "",
    title: trip?.title || "",
    destination: trip?.destination || "",
    country: trip?.country || "",
    location:
      typeof trip?.location?.name === "string" && trip.location.name.trim() !== ""
        ? trip.location.name
        : [trip?.destination, trip?.country].filter(Boolean).join(", "),
    category: trip?.category || "",
    startDate: trip?.startDate || "",
    endDate: trip?.endDate || "",
    priceMin: Number(trip?.priceMin) || 0,
    priceMax: Number(trip?.priceMax) || 0,
    totalSpots: Number(trip?.totalSpots) || 0,
    availableSpots: Number(trip?.availableSpots) || 0,
    description: trip?.description || "",
    coverImage: trip?.coverImage || "",
    bookings: Array.isArray(trip?.bookings)
      ? trip.bookings.map((booking: any) => ({
          id: booking?._id || booking?.id || "",
          fullName: typeof booking?.fullName === "string" ? booking.fullName : typeof booking?.traveler?.fullName === "string" ? booking.traveler.fullName : "",
          age: Number.isFinite(Number(booking?.age)) ? Number(booking.age) : null,
          gender: typeof booking?.gender === "string" ? booking.gender : "",
          phoneNumber: typeof booking?.phoneNumber === "string" ? booking.phoneNumber : "",
          email: typeof booking?.email === "string" ? booking.email : typeof booking?.traveler?.email === "string" ? booking.traveler.email : "",
          idProofImage: typeof booking?.idProofImage === "string" ? booking.idProofImage : "",
          bookedAt: booking?.bookedAt || booking?.createdAt || new Date().toISOString(),
          priceAtBooking: Number(booking?.priceAtBooking) || 0,
          travelerName: typeof booking?.traveler?.fullName === "string" ? booking.traveler.fullName : "",
          travelerEmail: typeof booking?.traveler?.email === "string" ? booking.traveler.email : "",
        }))
      : [],
    bookingsCount: Array.isArray(trip?.bookings) ? trip.bookings.length : 0,
  });

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

  useEffect(() => {
    const fetchProfileContent = async () => {
      const token = localStorage.getItem('token');

      if (!token || !realUserData?.userId) {
        setTravelerPosts([]);
        setOrganizerTrips([]);
        return;
      }

      setIsProfileContentLoading(true);

      try {
        if (currentUserType === "traveler") {
          const response = await fetch(`${API_BASE_URL}/posts/user/${realUserData.userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const data = await response.json();

          if (!response.ok || !data?.success) {
            throw new Error(data?.message || 'Failed to load posts');
          }

          const posts = Array.isArray(data?.data?.posts)
            ? data.data.posts.map((post: any) => mapTravelerPost(post))
            : [];

          setTravelerPosts(posts);
          setOrganizerTrips([]);
          setOrganizerReviews([]);
          setEditingTripId(null);
          setTripEditForm(null);
          setExpandedTripId(null);
        } else {
          const response = await fetch(`${API_BASE_URL}/trips/organizer/my-trips`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const data = await response.json();

          if (!response.ok || !data?.success) {
            throw new Error(data?.message || 'Failed to load trips');
          }

          const trips = Array.isArray(data?.data?.trips)
            ? data.data.trips.map((trip: any) => mapOrganizerTrip(trip))
            : [];

          const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/organizers/me?limit=20`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          const reviewsData = await reviewsResponse.json().catch(() => null);
          const loadedReviews = reviewsResponse.ok && reviewsData?.success
            ? (Array.isArray(reviewsData?.data?.reviews) ? reviewsData.data.reviews : [])
            : [];

          setOrganizerTrips(trips);
          setOrganizerReviews(loadedReviews);
          setTravelerPosts([]);
          setExpandedTripId((current) => (trips.some((trip: OrganizerTrip) => trip.id === current) ? current : null));
        }
      } catch (error) {
        console.error('Error loading profile content:', error);
        toast.error(
          currentUserType === 'traveler'
            ? 'Failed to load your posts'
            : 'Failed to load your trips'
        );
      } finally {
        setIsProfileContentLoading(false);
      }
    };

    fetchProfileContent();
  }, [currentUserType, realUserData?.userId]);

  const editingLocationQuery = tripEditForm?.location || "";

  useEffect(() => {
    if (!editingTripId) {
      setLocationSuggestions([]);
      setIsLoadingLocationSuggestions(false);
      return;
    }

    const query = editingLocationQuery.trim();
    if (query.length < 2) {
      setLocationSuggestions([]);
      setIsLoadingLocationSuggestions(false);
      return;
    }

    const abortController = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsLoadingLocationSuggestions(true);

        const response = await fetch(
          `${API_BASE_URL}/trips/locations/suggest?q=${encodeURIComponent(query)}`,
          { signal: abortController.signal }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch locations (${response.status})`);
        }

        const data = await response.json();
        const suggestions = Array.isArray(data?.data?.locations)
          ? data.data.locations
              .map((location: any) => (typeof location?.name === "string" ? location.name : ""))
              .filter((name: string) => name.length > 0)
          : [];

        setLocationSuggestions(Array.from(new Set(suggestions)));
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Location suggestions error:", error);
          setLocationSuggestions([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingLocationSuggestions(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [editingTripId, editingLocationQuery]);

  const handleDeletePost = async (postId: string) => {
    const shouldDelete = window.confirm('Delete this post?');
    if (!shouldDelete) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to delete posts');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to delete post');
      }

      setTravelerPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Delete post error:', error);
      toast.error('Failed to delete post');
    }
  };

  const startTripEdit = (trip: OrganizerTrip) => {
    setEditingTripId(trip.id);
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
    setTripEditForm({
      title: trip.title,
      destination: trip.destination,
      country: trip.country,
      location: trip.location,
      category: trip.category,
      startDate: formatDateInputValue(trip.startDate),
      endDate: formatDateInputValue(trip.endDate),
      priceMin: String(trip.priceMin),
      priceMax: String(trip.priceMax),
      totalSpots: String(trip.totalSpots),
      description: trip.description,
    });
  };

  const cancelTripEdit = () => {
    setEditingTripId(null);
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
    setTripEditForm(null);
  };

  const handleSelectLocationSuggestion = (locationName: string) => {
    updateTripField("location", locationName);
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
  };

  const updateTripField = (field: keyof TripEditForm, value: string) => {
    setTripEditForm((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleSaveTrip = async (tripId: string) => {
    if (!tripEditForm) {
      return;
    }

    const title = tripEditForm.title.trim();
    const destination = tripEditForm.destination.trim();
    const country = tripEditForm.country.trim();
    const location = tripEditForm.location.trim();
    const category = tripEditForm.category.trim();
    const description = tripEditForm.description.trim();
    const priceMin = Number(tripEditForm.priceMin);
    const priceMax = Number(tripEditForm.priceMax);
    const totalSpots = Number(tripEditForm.totalSpots);

    if (!title || !destination || !country || !location || !category || !tripEditForm.startDate || !tripEditForm.endDate || !description) {
      toast.error('Please fill all required trip fields');
      return;
    }

    if ([priceMin, priceMax, totalSpots].some((value) => Number.isNaN(value))) {
      toast.error('Please enter valid numeric values for price and spots');
      return;
    }

    if (priceMin > priceMax) {
      toast.error('Minimum price cannot be greater than maximum price');
      return;
    }

    if (totalSpots < 1) {
      toast.error('Total spots must be at least 1');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to update trips');
        return;
      }

      setIsSavingTrip(true);

      const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          destination,
          country,
          location,
          category,
          startDate: tripEditForm.startDate,
          endDate: tripEditForm.endDate,
          priceMin,
          priceMax,
          totalSpots,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to update trip');
      }

      const updatedTrip = mapOrganizerTrip(data?.data);
      setOrganizerTrips((prevTrips) =>
        prevTrips.map((trip) => (trip.id === tripId ? updatedTrip : trip))
      );
      toast.success('Trip updated successfully');
      cancelTripEdit();
    } catch (error) {
      console.error('Update trip error:', error);
      toast.error('Failed to update trip');
    } finally {
      setIsSavingTrip(false);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    const shouldDelete = window.confirm('Delete this trip?');
    if (!shouldDelete) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to delete trips');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to delete trip');
      }

      setOrganizerTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== tripId));

      if (editingTripId === tripId) {
        cancelTripEdit();
      }

      if (expandedTripId === tripId) {
        setExpandedTripId(null);
      }

      toast.success('Trip deleted successfully');
    } catch (error) {
      console.error('Delete trip error:', error);
      toast.error('Failed to delete trip');
    }
  };

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

          {/* Traveler-Specific: Posts Section */}
          {currentUserType === "traveler" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Posts</h2>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {travelerPosts.length} total
                </span>
              </div>

              {isProfileContentLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-28 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 animate-pulse"
                    />
                  ))}
                </div>
              ) : travelerPosts.length > 0 ? (
                <div className="space-y-4">
                  {travelerPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-900 dark:text-white">
                            {post.content || "(No caption)"}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                            {post.location && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="size-4" />
                                {post.location}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="size-4" />
                              {getTimeAgo(post.createdAt)}
                            </span>
                            <span>{post.likesCount} likes</span>
                            <span>{post.commentsCount} comments</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </button>
                      </div>

                      {post.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          {post.images.slice(0, 3).map((image, index) => (
                            <img
                              key={`${post.id}-${index}`}
                              src={image}
                              alt={`Post ${index + 1}`}
                              className="h-24 w-full object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bookmark className="size-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-500 dark:text-slate-400">You have not created any posts yet</p>
                </div>
              )}
            </div>
          )}

          {/* Organizer-Specific: Created Trips Management */}
          {currentUserType === "organizer" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Created Trips</h2>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {organizerTrips.length} total
                </span>
              </div>

              {isProfileContentLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-36 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 animate-pulse"
                    />
                  ))}
                </div>
              ) : organizerTrips.length > 0 ? (
                <div className="space-y-4">
                  {organizerTrips.map((trip) => {
                    const isEditing = editingTripId === trip.id && tripEditForm !== null;
                    const isExpanded = expandedTripId === trip.id;

                    return (
                      <div
                        key={trip.id}
                        onClick={() => {
                          if (!isEditing) {
                            setExpandedTripId((current) => (current === trip.id ? null : trip.id));
                          }
                        }}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer hover:border-teal-300 dark:hover:border-teal-700"
                      >
                        {isEditing && tripEditForm ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input
                                value={tripEditForm.title}
                                onChange={(e) => updateTripField("title", e.target.value)}
                                placeholder="Title"
                                className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                              />
                              <input
                                value={tripEditForm.destination}
                                onChange={(e) => updateTripField("destination", e.target.value)}
                                placeholder="Destination"
                                className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                              />
                              <input
                                value={tripEditForm.country}
                                onChange={(e) => updateTripField("country", e.target.value)}
                                placeholder="Country"
                                className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                              />
                              <div className="sm:col-span-2 relative">
                                <input
                                  value={tripEditForm.location}
                                  onFocus={() => setShowLocationSuggestions(true)}
                                  onChange={(e) => {
                                    updateTripField("location", e.target.value);
                                    setShowLocationSuggestions(true);
                                  }}
                                  onBlur={() => {
                                    window.setTimeout(() => setShowLocationSuggestions(false), 150);
                                  }}
                                  placeholder="Exact Location"
                                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                                />
                                {showLocationSuggestions && (isLoadingLocationSuggestions || tripEditForm.location.trim().length >= 2) && (
                                  <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
                                    {isLoadingLocationSuggestions ? (
                                      <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">Searching locations...</p>
                                    ) : locationSuggestions.length > 0 ? (
                                      <div className="max-h-56 overflow-y-auto">
                                        {locationSuggestions.map((suggestion, index) => (
                                          <button
                                            key={`${suggestion}-${index}`}
                                            type="button"
                                            onMouseDown={(event) => event.preventDefault()}
                                            onClick={() => handleSelectLocationSuggestion(suggestion)}
                                            className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                          >
                                            {suggestion}
                                          </button>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">No matching locations found</p>
                                    )}
                                  </div>
                                )}
                              </div>
                              <input
                                value={tripEditForm.category}
                                onChange={(e) => updateTripField("category", e.target.value)}
                                placeholder="Category"
                                className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                              />
                              <input
                                type="date"
                                value={tripEditForm.startDate}
                                onChange={(e) => updateTripField("startDate", e.target.value)}
                                className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                              />
                              <input
                                type="date"
                                value={tripEditForm.endDate}
                                onChange={(e) => updateTripField("endDate", e.target.value)}
                                className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                              />
                              <input
                                type="number"
                                min={0}
                                value={tripEditForm.priceMin}
                                onChange={(e) => updateTripField("priceMin", e.target.value)}
                                placeholder="Min Price"
                                className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                              />
                              <input
                                type="number"
                                min={0}
                                value={tripEditForm.priceMax}
                                onChange={(e) => updateTripField("priceMax", e.target.value)}
                                placeholder="Max Price"
                                className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                              />
                              <input
                                type="number"
                                min={1}
                                value={tripEditForm.totalSpots}
                                onChange={(e) => updateTripField("totalSpots", e.target.value)}
                                placeholder="Total Spots"
                                className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                              />
                            </div>
                            <textarea
                              rows={3}
                              value={tripEditForm.description}
                              onChange={(e) => updateTripField("description", e.target.value)}
                              placeholder="Description"
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                            />
                            <div className="flex flex-wrap items-center justify-end gap-3">
                              <button
                                onClick={cancelTripEdit}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                              >
                                <XCircle className="size-4" />
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveTrip(trip.id)}
                                disabled={isSavingTrip}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 disabled:bg-teal-400 transition-colors"
                              >
                                <Save className="size-4" />
                                {isSavingTrip ? "Saving..." : "Save Changes"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                              {trip.coverImage ? (
                                <ImageWithFallback
                                  src={trip.coverImage}
                                  alt={trip.title}
                                  className="h-24 w-full sm:w-36 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="h-24 w-full sm:w-36 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                  <MapPin className="size-5 text-slate-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                                  {trip.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                  {trip.destination}, {trip.country}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                  <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                                    {trip.category}
                                  </span>
                                  <span>
                                    {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "-"} - {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : "-"}
                                  </span>
                                  <span>${trip.priceMin} - ${trip.priceMax}</span>
                                  <span>{trip.availableSpots}/{trip.totalSpots} spots left</span>
                                  <span>{trip.bookingsCount} bookings</span>
                                </div>
                                {trip.description && (
                                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                                    {trip.description}
                                  </p>
                                )}
                                <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-teal-600 dark:text-teal-400">
                                  <span>{isExpanded ? "Hide booking details" : "View booking details"}</span>
                                  {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  startTripEdit(trip);
                                }}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                              >
                                <Pencil className="size-4" />
                                Update
                              </button>
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDeleteTrip(trip.id);
                                }}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                              >
                                <Trash2 className="size-4" />
                                Delete
                              </button>
                            </div>

                            {isExpanded && (
                              <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/40 p-4 space-y-4">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-white">Traveler Booking Details</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Each booking submitted through the trip popup appears here.</p>
                                  </div>
                                  <span className="text-sm text-slate-500 dark:text-slate-400">{trip.bookingsCount} total</span>
                                </div>

                                {trip.bookings.length > 0 ? (
                                  <div className="grid gap-3">
                                    {trip.bookings.map((booking) => (
                                      <div
                                        key={booking.id}
                                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4"
                                      >
                                        <div className="flex items-start justify-between gap-4">
                                          <div>
                                            <h5 className="font-medium text-slate-900 dark:text-white">{booking.fullName || booking.travelerName || "Traveller"}</h5>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Booked on {booking.bookedAt ? new Date(booking.bookedAt).toLocaleString() : "-"}</p>
                                          </div>
                                          <span className="text-sm font-medium text-teal-600 dark:text-teal-400">${booking.priceAtBooking}</span>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300">
                                          <p><span className="font-medium text-slate-900 dark:text-white">Age:</span> {booking.age ?? "-"}</p>
                                          <p><span className="font-medium text-slate-900 dark:text-white">Gender:</span> {booking.gender || "-"}</p>
                                          <p><span className="font-medium text-slate-900 dark:text-white">Phone:</span> {booking.phoneNumber || "-"}</p>
                                          <p><span className="font-medium text-slate-900 dark:text-white">Email:</span> {booking.email || booking.travelerEmail || "-"}</p>
                                          <p className="md:col-span-2">
                                            <span className="font-medium text-slate-900 dark:text-white">ID Proof:</span>{" "}
                                            {booking.idProofImage ? (
                                              <a
                                                href={booking.idProofImage}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-teal-600 dark:text-teal-400 hover:underline"
                                              >
                                                View uploaded image
                                              </a>
                                            ) : (
                                              "-"
                                            )}
                                          </p>
                                        </div>

                                        {booking.idProofImage && (
                                          <div className="mt-3">
                                            <img
                                              src={booking.idProofImage}
                                              alt="Uploaded ID proof"
                                              className="h-24 w-40 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-500 dark:text-slate-400">No traveler bookings yet for this trip.</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="size-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-500 dark:text-slate-400">You have not created any trips yet</p>
                </div>
              )}
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
                  ) : currentUserType === "organizer" && organizerReviews.length > 0 ? (
                    organizerReviews.map((review) => (
                      <div
                        key={review._id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-start justify-between mb-2 gap-3">
                          <div>
                            <h3 className="font-medium text-slate-900 dark:text-white">
                              @{review.reviewerUserIdSnapshot || "traveler"}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Trip: {review.trip?.title || review.trip?.destination || "Trip"} • {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Organizer Rating</p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {review.organizerReview?.rating ?? 0}/5
                            </p>
                          </div>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 mb-1">
                          {review.organizerReview?.text || ""}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Star className="size-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                      <p className="text-slate-500 dark:text-slate-400">
                        {currentUserType === "organizer"
                          ? "No organizer reviews yet"
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