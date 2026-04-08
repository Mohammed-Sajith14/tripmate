import { useEffect, useState } from "react";
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
  Check,
  X as XIcon,
  ChevronDown,
  ChevronUp,
  Upload,
  Star,
  Shield,
  Info,
  MessageCircle
} from "lucide-react";
import { Trip } from "./TripsPage";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { toast } from "sonner";
import { API_BASE_URL, clearAuthSession, getValidAuthToken } from "../../../utils/auth";

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

interface BookingFormState {
  fullName: string;
  age: string;
  gender: string;
  phoneNumber: string;
  email: string;
  idProofImage: string;
}

// Fallback mock data for demo/mock trips only
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

export function TripDetailPage({ trip: initialTrip, isDark, toggleTheme, onNavigate, onBack }: TripDetailPageProps) {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isTraveler = currentUser?.role === "traveler";
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [isStartingInquiry, setIsStartingInquiry] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isCancellingBooking, setIsCancellingBooking] = useState(false);
  const [isBookingPopupOpen, setIsBookingPopupOpen] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [hasBooked, setHasBooked] = useState(false);
  const [fullTrip, setFullTrip] = useState<Trip | null>(null);
  const trip = fullTrip || initialTrip;
  const [isLoadingTripDetails, setIsLoadingTripDetails] = useState(false);
  const [availableSpots, setAvailableSpots] = useState(initialTrip.availableSpots);
  const buildBookingForm = (): BookingFormState => ({
    fullName: typeof currentUser?.fullName === 'string' ? currentUser.fullName : '',
    age: '',
    gender: '',
    phoneNumber: '',
    email: typeof currentUser?.email === 'string' ? currentUser.email : '',
    idProofImage: '',
  });
  const [bookingForm, setBookingForm] = useState<BookingFormState>(() => buildBookingForm());
  
  // Check if trip ID is a valid MongoDB ObjectId (24-char hex string)
  const isValidObjectId = /^[0-9a-f]{24}$/i.test(String(trip.id));
  const isMockTrip = !isValidObjectId;

  useEffect(() => {
    setAvailableSpots(Number(trip.availableSpots) || 0);
  }, [trip.availableSpots]);

  useEffect(() => {
    if (!trip?.id) {
      return;
    }

    try {
      const recentTrip = {
        tripId: String(trip.id),
        title: trip.title,
        destination: trip.destination,
        country: trip.country,
        category: trip.category,
        duration: trip.duration,
        budgetMin: trip.budgetMin,
        budgetMax: trip.budgetMax,
        organizerId: trip.organizerId,
        organizerName: trip.organizerName,
        viewedAt: Date.now(),
      };

      localStorage.setItem('recentViewedTrip', JSON.stringify(recentTrip));
    } catch (error) {
      console.error('Error storing recent trip:', error);
    }
  }, [trip.id, trip.title, trip.destination, trip.country, trip.category, trip.organizerId, trip.organizerName]);

  useEffect(() => {
    if (!isValidObjectId) {
      setFullTrip(null);
      return;
    }

    const fetchTripDetails = async () => {
      setIsLoadingTripDetails(true);
      try {
        const response = await fetch(`${API_BASE_URL}/trips/${trip.id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch trip details (${response.status})`);
        }

        const payload = await response.json();
        const backendTrip = payload?.data;
        if (!backendTrip) {
          return;
        }

        const startDate = new Date(backendTrip.startDate);
        const endDate = new Date(backendTrip.endDate);
        const duration =
          Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())
            ? trip.duration
            : Math.max(
                1,
                Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
              );

        setFullTrip({
          ...trip,
          id: backendTrip._id || trip.id,
          title: backendTrip.title || trip.title,
          destination: backendTrip.destination || trip.destination,
          country: backendTrip.country || trip.country,
          category: backendTrip.category || trip.category,
          duration,
          budgetMin: Number(backendTrip.priceMin) || trip.budgetMin,
          budgetMax: Number(backendTrip.priceMax) || trip.budgetMax,
          organizerId:
            backendTrip.organizer?.userId ||
            String(backendTrip.organizer?._id || trip.organizerId || ''),
          organizerName:
            backendTrip.organizer?.fullName ||
            backendTrip.organizer?.organizationName ||
            backendTrip.organizer?.userId ||
            trip.organizerName,
          organizerRating:
            typeof backendTrip.organizer?.rating === 'number'
              ? backendTrip.organizer.rating
              : trip.organizerRating,
          startDate: backendTrip.startDate || trip.startDate,
          endDate: backendTrip.endDate || trip.endDate,
          image:
            typeof backendTrip.coverImage === 'string' && backendTrip.coverImage.trim() !== ''
              ? backendTrip.coverImage
              : trip.image,
          availableSpots: Number(backendTrip.availableSpots) || trip.availableSpots,
          totalSpots: Number(backendTrip.totalSpots) || trip.totalSpots,
          description: backendTrip.description || trip.description,
          itinerary: Array.isArray(backendTrip.itinerary)
            ? backendTrip.itinerary
            : trip.itinerary || [],
          inclusions: Array.isArray(backendTrip.inclusions)
            ? backendTrip.inclusions
            : trip.inclusions || [],
          exclusions: Array.isArray(backendTrip.exclusions)
            ? backendTrip.exclusions
            : trip.exclusions || [],
          cancellationPolicy: backendTrip.cancellationPolicy || trip.cancellationPolicy,
          refundPolicy: backendTrip.refundPolicy || trip.refundPolicy,
          minimumGroupSize: backendTrip.minimumGroupSize || trip.minimumGroupSize,
          requirements: backendTrip.requirements || trip.requirements,
          importantNotes: backendTrip.importantNotes || trip.importantNotes,
        });
      } catch (error) {
        console.error('Error loading full trip details:', error);
      } finally {
        setIsLoadingTripDetails(false);
      }
    };

    fetchTripDetails();
  }, [initialTrip.id]);

  useEffect(() => {
    if (!isTraveler || !isValidObjectId) {
      setHasBooked(false);
      return;
    }

    const checkBookingStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          return;
        }

        const response = await fetch(`${API_BASE_URL}/trips/bookings/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const bookings = Array.isArray(data?.data?.bookings) ? data.data.bookings : [];
        const tripId = String(trip.id);
        const hasActiveBooking = bookings.some((booking: any) => {
          const bookingTripId = String(booking?.trip?._id || booking?.trip?.id || "");
          return bookingTripId === tripId;
        });

        setHasBooked(hasActiveBooking);
      } catch (error) {
        console.error("Error checking booking status:", error);
      }
    };

    checkBookingStatus();
  }, [isTraveler, isValidObjectId, trip.id]);

  // Use real trip data (itinerary, inclusions, exclusions) if available
  // Fall back to mock data only for demo/mock trips
  const itinerary = (trip as any)?.itinerary && Array.isArray((trip as any).itinerary) && (trip as any).itinerary.length > 0 
    ? (trip as any).itinerary 
    : (isMockTrip ? mockItinerary[trip.id as number] || mockItinerary[1] || [] : []);
  
  const inclusions = (trip as any)?.inclusions && Array.isArray((trip as any).inclusions) && (trip as any).inclusions.length > 0
    ? (trip as any).inclusions.filter((item: any) => item && item.trim() !== '')
    : (isMockTrip ? mockInclusions : []);
  
  const exclusions = (trip as any)?.exclusions && Array.isArray((trip as any).exclusions) && (trip as any).exclusions.length > 0
    ? (trip as any).exclusions.filter((item: any) => item && item.trim() !== '')
    : (isMockTrip ? mockExclusions : []);

  const toggleDay = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const handleAskOrganizer = async () => {
    if (isMockTrip) {
      toast.error("Ask Organizer is available only for published trips from the backend");
      return;
    }

    setIsStartingInquiry(true);
    try {
      const token = getValidAuthToken();
      if (!token) {
        toast.error("Your session expired. Please login again");
        onNavigate("auth");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/messages/inquiry/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tripId: trip.id,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        const errorMessage = data?.message || "Unable to send your message right now";

        if (response.status === 401) {
          clearAuthSession();
          toast.error("Session expired. Please login again");
          onNavigate("auth");
          return;
        }

        toast.error(errorMessage);
        return;
      }

      const createdConversationId =
        data?.data?.conversation?._id || data?.data?.conversation?.id;
      if (createdConversationId) {
        localStorage.setItem("pendingConversationId", createdConversationId);
      }
      const organizerIdentifier = String(trip.organizerId || "");
      localStorage.setItem("pendingConversationOrganizerId", organizerIdentifier.toLowerCase());
      localStorage.setItem("pendingConversationOrganizerRaw", organizerIdentifier);
      localStorage.setItem("pendingConversationTripId", String(trip.id));

      toast.success("Opening chat with organizer...");
      onNavigate("messages");
    } catch (error) {
      console.error("Error starting inquiry:", error);
      toast.error("Network error while opening chat");
    } finally {
      setIsStartingInquiry(false);
    }
  };

  const openBookingPopup = () => {
    if (isMockTrip) {
      alert("This is a demo trip. Create a real trip as an organizer or book one of the published trips.");
      return;
    }

    if (!isTraveler || hasBooked || isBooking || availableSpots <= 0) {
      return;
    }

    setBookingForm(buildBookingForm());
    setIsBookingPopupOpen(true);
  };

  const handleIdProofFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      handleBookingFieldChange('idProofImage', '');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file for ID proof');
      event.target.value = '';
      handleBookingFieldChange('idProofImage', '');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      handleBookingFieldChange('idProofImage', result);
    };
    reader.onerror = () => {
      toast.error('Unable to read the selected file');
      handleBookingFieldChange('idProofImage', '');
    };
    reader.readAsDataURL(file);
  };

  const clearIdProofImage = () => {
    setBookingForm((prev) => ({
      ...prev,
      idProofImage: '',
    }));
  };

  const handleViewOrganizerProfile = () => {
    const organizerId = String(trip.organizerId || '').trim();
    if (!organizerId) {
      toast.error('Organizer profile is not available right now');
      return;
    }

    localStorage.setItem('pendingProfileUserId', organizerId);
    onNavigate('home');
  };

  const handleCancelTripBooking = async () => {
    const shouldCancel = window.confirm('Are you sure you want to cancel this trip booking?');
    if (!shouldCancel) {
      return;
    }

    setIsCancellingBooking(true);
    try {
      const token = getValidAuthToken();
      if (!token) {
        toast.error('Your session expired. Please login again');
        onNavigate('auth');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/trips/${trip.id}/book`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        if (response.status === 401) {
          clearAuthSession();
          toast.error('Your session expired. Please login again');
          onNavigate('auth');
          return;
        }

        toast.error(data?.message || 'Unable to cancel this booking right now');
        return;
      }

      setHasBooked(false);
      setAvailableSpots(data?.data?.trip?.availableSpots ?? Math.min(trip.totalSpots, availableSpots + 1));
      toast.success('Trip booking cancelled');
    } catch (error) {
      console.error('Cancel booking error:', error);
      toast.error('Unable to cancel booking. Please try again.');
    } finally {
      setIsCancellingBooking(false);
    }
  };

  const handleBookingFieldChange = (field: keyof BookingFormState, value: string) => {
    setBookingForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBookTrip = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fullName = bookingForm.fullName.trim();
    const age = Number(bookingForm.age);
    const gender = bookingForm.gender.trim();
    const phoneNumber = bookingForm.phoneNumber.trim();
    const email = bookingForm.email.trim();
    const idProofImage = bookingForm.idProofImage.trim();

    if (
      !fullName ||
      !Number.isInteger(age) ||
      age < 1 ||
      !gender ||
      !phoneNumber ||
      !email ||
      !idProofImage
    ) {
      toast.error("Please fill in all traveller details");
      return;
    }

    setIsBooking(true);
    setIsSubmittingBooking(true);
    try {
      const token = getValidAuthToken();
      if (!token) {
        toast.error("Your session expired. Please login again");
        onNavigate("auth");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/trips/${trip.id}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          age,
          gender,
          phoneNumber,
          email,
          idProofImage,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 401) {
          clearAuthSession();
          toast.error("Your session expired. Please login again");
          onNavigate("auth");
          return;
        }

        toast.error(data?.message || "Unable to book this trip right now");
        return;
      }

      setHasBooked(true);
      setAvailableSpots(data?.data?.trip?.availableSpots ?? Math.max(0, availableSpots - 1));
      setIsBookingPopupOpen(false);
      setBookingForm(buildBookingForm());
      toast.success("Trip booked successfully!");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Unable to complete booking. Please try again.");
    } finally {
      setIsBooking(false);
      setIsSubmittingBooking(false);
    }
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
                  {trip.image ? (
                    <ImageWithFallback
                      src={trip.image}
                      alt={trip.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <MapPin className="size-10 text-slate-400 dark:text-slate-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-teal-500 text-white text-sm rounded-full">
                        {trip.category}
                      </span>
                    </div>
                    <h1 className="text-3xl font-semibold text-white mb-2">
                      {trip.title}
                    </h1>
                    {isLoadingTripDetails && (
                      <p className="text-sm text-white/80 mb-2">Refreshing latest trip details...</p>
                    )}
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
                      <Users className="size-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Group Size</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {availableSpots}/{trip.totalSpots} spots
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
                    {trip.organizerName?.charAt(0) || "O"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      {trip.organizerName}
                    </h3>
                    {trip.organizerRating > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="size-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium text-slate-900 dark:text-white">{trip.organizerRating}</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">• Professional Travel Organizer</span>
                      </div>
                    )}
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Organizer profile details will appear here when available.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleViewOrganizerProfile}
                        className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
                      >
                        View Organizer Profile →
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Ask Organizer Button */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={handleAskOrganizer}
                    disabled={isStartingInquiry}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                  >
                    <MessageCircle className="size-5" />
                    {isStartingInquiry ? "Opening Chat..." : "Ask Organizer Your Doubts & Questions"}
                  </button>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2">
                    Message the organizer directly about any questions regarding this trip
                  </p>
                </div>
              </div>

              {/* Trip Description */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  About This Trip
                </h2>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {trip.description?.trim() || "No description provided by the organizer."}
                  </p>
                </div>
              </div>

              {/* Day-wise Itinerary */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Day-by-Day Itinerary
                </h2>
                <div className="space-y-3">
                  {itinerary.map((day: DayItinerary) => (
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
                      {inclusions && inclusions.length > 0 ? (
                        inclusions.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <Check className="size-4 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-slate-500 dark:text-slate-400 italic">No inclusions listed</li>
                      )}
                    </ul>
                  </div>
                  {/* Exclusions */}
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <XIcon className="size-5 text-slate-400" />
                      Not Included
                    </h3>
                    <ul className="space-y-2">
                      {exclusions && exclusions.length > 0 ? (
                        exclusions.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <XIcon className="size-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-slate-500 dark:text-slate-400 italic">No exclusions listed</li>
                      )}
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
                  {trip.cancellationPolicy && (
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                        Cancellation Policy
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                        {trip.cancellationPolicy}
                      </p>
                    </div>
                  )}
                  {trip.refundPolicy && (
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                        Refund Policy
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                        {trip.refundPolicy}
                      </p>
                    </div>
                  )}
                  {trip.requirements && (
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                        Requirements
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                        {trip.requirements}
                      </p>
                    </div>
                  )}
                  {trip.minimumGroupSize && trip.minimumGroupSize > 1 && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/30">
                      <Info className="size-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-900 dark:text-amber-200">
                        This trip requires a minimum group size of {trip.minimumGroupSize} participants.
                      </p>
                    </div>
                  )}
                  {trip.importantNotes && (
                    <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <Info className="size-5 text-slate-600 dark:text-slate-300 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
                        {trip.importantNotes}
                      </p>
                    </div>
                  )}
                  {!trip.cancellationPolicy && !trip.refundPolicy && !trip.requirements && !trip.importantNotes && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      No policy information provided by the organizer.
                    </p>
                  )}
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
                        {availableSpots} of {trip.totalSpots}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Start Date</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={hasBooked ? handleCancelTripBooking : openBookingPopup}
                    disabled={isMockTrip || !isTraveler || isBooking || isCancellingBooking || (!hasBooked && availableSpots <= 0)}
                    className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors mb-3"
                  >
                    {isMockTrip
                      ? "Demo Trip"
                      : hasBooked
                      ? isCancellingBooking
                        ? "Cancelling..."
                        : "Cancel Trip"
                      : !isTraveler
                      ? "Only Travelers Can Book"
                      : availableSpots <= 0
                      ? "Sold Out"
                      : isBooking
                      ? "Booking..."
                      : "Book This Trip"}
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
            <button
              onClick={hasBooked ? handleCancelTripBooking : openBookingPopup}
              disabled={isMockTrip || !isTraveler || isBooking || isCancellingBooking || (!hasBooked && availableSpots <= 0)}
              className="flex-1 py-3 px-6 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
            >
              {isMockTrip
                ? "Demo Trip"
                : hasBooked
                ? isCancellingBooking
                  ? "Cancelling..."
                  : "Cancel Trip"
                : !isTraveler
                ? "Only Travelers Can Book"
                : availableSpots <= 0
                ? "Sold Out"
                : isBooking
                ? "Booking..."
                : "Book This Trip"}
            </button>
          </div>
        </div>
      </div>

      {isBookingPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsBookingPopupOpen(false)}>
          <div
            className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">Traveller Booking Details</p>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Complete your booking</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">These details will be shared with the organizer for trip confirmation.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingPopupOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close booking popup"
              >
                <XIcon className="size-5" />
              </button>
            </div>

            <form onSubmit={handleBookTrip} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</span>
                  <input
                    type="text"
                    required
                    value={bookingForm.fullName}
                    onChange={(event) => handleBookingFieldChange('fullName', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-teal-500"
                    placeholder="Enter your full name"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Age</span>
                  <input
                    type="number"
                    min={1}
                    required
                    value={bookingForm.age}
                    onChange={(event) => handleBookingFieldChange('age', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-teal-500"
                    placeholder="Your age"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</span>
                  <select
                    required
                    value={bookingForm.gender}
                    onChange={(event) => handleBookingFieldChange('gender', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-teal-500"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</span>
                  <input
                    type="tel"
                    required
                    value={bookingForm.phoneNumber}
                    onChange={(event) => handleBookingFieldChange('phoneNumber', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-teal-500"
                    placeholder="Phone number"
                  />
                </label>
                <label className="space-y-2 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</span>
                  <input
                    type="email"
                    required
                    value={bookingForm.email}
                    onChange={(event) => handleBookingFieldChange('email', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-teal-500"
                    placeholder="Email address"
                  />
                </label>
                <div className="sm:col-span-2 space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">ID Proof Image</span>
                  <label className="flex flex-col items-center justify-center w-full min-h-40 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-teal-500 dark:hover:border-teal-500 transition-colors bg-slate-50 dark:bg-slate-950/50 overflow-hidden">
                    {bookingForm.idProofImage ? (
                      <div className="w-full p-4 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">Image uploaded</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Click to replace your ID proof image</p>
                          </div>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              clearIdProofImage();
                            }}
                            className="px-3 py-2 rounded-lg text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                        <img
                          src={bookingForm.idProofImage}
                          alt="ID proof preview"
                          className="w-full h-40 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                        <Upload className="size-10 text-slate-400 dark:text-slate-600 mb-3" />
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">
                          Click to upload ID proof image
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      required
                      onChange={handleIdProofFileChange}
                    />
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Upload any valid ID proof image (passport, national ID, driving license, etc.).</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsBookingPopupOpen(false)}
                  className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-medium transition-colors"
                >
                  {isSubmittingBooking ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation (Mobile) */}
      <BottomNav activePage="trips" onNavigate={onNavigate} />
    </div>
  );
}
