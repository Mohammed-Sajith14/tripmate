import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Trips } from "./components/Trips";
import { Reviews } from "./components/Reviews";
import { Footer } from "./components/Footer";
import { AuthPage } from "./components/auth/AuthPage";
import { HomePage } from "./components/home/HomePage";
import { ProfilePage } from "./components/profile/ProfilePage";
import { TripsPage, Trip } from "./components/trips/TripsPage";
import { TripDetailPage } from "./components/trips/TripDetailPage";
import { CreateTripPage } from "./components/create/CreateTripPage";
import { MessagesPage } from "./components/messages/MessagesPage";
import { MapsPage } from "./components/maps/MapsPage";
import { Toaster } from "./components/ui/sonner";

type Page = "landing" | "auth" | "home" | "profile" | "trips" | "tripDetail" | "maps" | "messages" | "create" | "more";

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [userType, setUserType] = useState<"traveler" | "organizer">("traveler");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDark(shouldBeDark);

    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Navigate back to landing page
    setCurrentPage('landing');
    console.log('User logged out');
  };

  const handleAuthComplete = () => {
    // Get user data from localStorage and set userType
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserType(user.role || 'traveler');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setCurrentPage("home");
  };

  const handleViewTripDetail = (trip: Trip) => {
    setSelectedTrip(trip);
    setCurrentPage("tripDetail");
  };

  if (currentPage === "auth") {
    return (
      <>
        <AuthPage
          isDark={isDark}
          toggleTheme={toggleTheme}
          onComplete={handleAuthComplete}
        />
        <Toaster />
      </>
    );
  }

  if (currentPage === "home") {
    return (
      <>
        <HomePage
          isDark={isDark}
          toggleTheme={toggleTheme}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
        <Toaster />
      </>
    );
  }

  if (currentPage === "profile") {
    return (
      <>
        <ProfilePage
          isDark={isDark}
          toggleTheme={toggleTheme}
          onNavigate={handleNavigate}
          userType={userType}
        />
        <Toaster />
      </>
    );
  }

  if (currentPage === "trips") {
    return (
      <>
        <TripsPage
          isDark={isDark}
          toggleTheme={toggleTheme}
          onNavigate={handleNavigate}
          onViewTripDetail={handleViewTripDetail}
        />
        <Toaster />
      </>
    );
  }

  if (currentPage === "tripDetail" && selectedTrip) {
    return (
      <>
        <TripDetailPage
          isDark={isDark}
          toggleTheme={toggleTheme}
          onNavigate={handleNavigate}
          trip={selectedTrip}
          onBack={() => setCurrentPage("trips")}
        />
        <Toaster />
      </>
    );
  }

  if (currentPage === "create") {
    return (
      <>
        <CreateTripPage
          isDark={isDark}
          toggleTheme={toggleTheme}
          onNavigate={handleNavigate}
          userType={userType}
        />
        <Toaster />
      </>
    );
  }

  if (currentPage === "messages") {
    return (
      <>
        <MessagesPage
          isDark={isDark}
          toggleTheme={toggleTheme}
          onNavigate={handleNavigate}
        />
        <Toaster />
      </>
    );
  }

  if (currentPage === "maps") {
    return (
      <>
        <MapsPage
          isDark={isDark}
          toggleTheme={toggleTheme}
          onNavigate={handleNavigate}
        />
        <Toaster />
      </>
    );
  }

  if (currentPage === "more") {
    return (
      <>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} Page
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              This page is coming soon!
            </p>
            <button
              onClick={() => setCurrentPage("home")}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
      <div className="fixed bottom-4 left-4 z-50 bg-teal-500 text-white px-4 py-3 rounded-lg shadow-xl">
        <p className="text-xs font-semibold mb-2">Quick Demo Navigation:</p>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <button
            onClick={() => setCurrentPage("auth")}
            className="px-3 py-1 bg-white text-teal-600 text-xs rounded font-medium hover:bg-gray-100 transition-colors"
          >
            Auth
          </button>
          <button
            onClick={() => setCurrentPage("home")}
            className="px-3 py-1 bg-white text-teal-600 text-xs rounded font-medium hover:bg-gray-100 transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => setCurrentPage("profile")}
            className="px-3 py-1 bg-white text-teal-600 text-xs rounded font-medium hover:bg-gray-100 transition-colors"
          >
            Profile
          </button>
          <button
            onClick={() => setCurrentPage("trips")}
            className="px-3 py-1 bg-white text-teal-600 text-xs rounded font-medium hover:bg-gray-100 transition-colors"
          >
            Trips
          </button>
          <button
            onClick={() => setCurrentPage("maps")}
            className="px-3 py-1 bg-white text-teal-600 text-xs rounded font-medium hover:bg-gray-100 transition-colors"
          >
            Maps
          </button>
          <button
            onClick={() => setCurrentPage("messages")}
            className="px-3 py-1 bg-white text-teal-600 text-xs rounded font-medium hover:bg-gray-100 transition-colors"
          >
            Messages
          </button>
        </div>
        <div className="pt-2 border-t border-teal-400/30">
          <p className="text-xs mb-1.5">Role: <span className="font-semibold">{userType === "organizer" ? "Organizer" : "Traveler"}</span></p>
          <button
            onClick={() => setUserType(userType === "organizer" ? "traveler" : "organizer")}
            className="w-full px-3 py-1.5 bg-white text-teal-600 text-xs rounded font-medium hover:bg-gray-100 transition-colors"
          >
            Switch to {userType === "organizer" ? "Traveler" : "Organizer"}
          </button>
        </div>
      </div>

      <Header isDark={isDark} toggleTheme={toggleTheme} />
      <main>
        <Hero onAuthClick={() => setCurrentPage("auth")} />
        <About />
        <Trips />
        <Reviews />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}