import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

import { LeftNav } from "../home/LeftNav";
import { TopBar } from "../home/TopBar";
import { BottomNav } from "../home/BottomNav";
import { MapFilters, Filters } from "./MapFilters";
import { TripPreviewPopup, TripData } from "./TripPreviewPopup";
import { Trip } from "../trips/TripsPage";
import { SlidersHorizontal } from "lucide-react";

import { API_BASE_URL } from "../../../utils/auth";
const FALLBACK_TRIP_IMAGE = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600";

/* ---------------- FIX DEFAULT MARKER ICON ---------------- */

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ---------------- CUSTOM COLORED ICON ---------------- */

const createIcon = (color: string) =>
  new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path fill="${color}" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z"/>
        <circle cx="12.5" cy="12.5" r="5" fill="white"/>
      </svg>
    `)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });

const beachIcon = createIcon("#3b82f6");
const hillsIcon = createIcon("#10b981");
const adventureIcon = createIcon("#f97316");
const culturalIcon = createIcon("#a855f7");

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const getDurationLabel = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) {
    return "Duration TBD";
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Duration TBD";
  }

  const days = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );

  return `${days} day${days > 1 ? "s" : ""}`;
};

type MapTrip = TripData & {
  detailTrip: Trip;
};

const mapBackendTripToDetailTrip = (trip: any): Trip => {
  const startDate = new Date(trip?.startDate);
  const endDate = new Date(trip?.endDate);
  const duration =
    Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())
      ? 1
      : Math.max(
          1,
          Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        );

  return {
    id: trip?._id,
    title: trip?.title || "Untitled Trip",
    destination: trip?.destination || "Unknown",
    country: trip?.country || "Unknown",
    category: trip?.category || "Other",
    duration,
    budgetMin: Number(trip?.priceMin) || 0,
    budgetMax: Number(trip?.priceMax) || 0,
    organizerId: trip?.organizer?.userId || String(trip?.organizer?._id || trip?.organizer || ""),
    organizerName:
      trip?.organizer?.fullName ||
      trip?.organizer?.organizationName ||
      trip?.organizer?.userId ||
      "Organizer",
    organizerRating: typeof trip?.organizer?.rating === "number" ? trip.organizer.rating : 0,
    startDate: trip?.startDate,
    endDate: trip?.endDate,
    image:
      typeof trip?.coverImage === "string" && trip.coverImage.trim() !== ""
        ? trip.coverImage
        : FALLBACK_TRIP_IMAGE,
    availableSpots: Number(trip?.availableSpots) || 0,
    totalSpots: Number(trip?.totalSpots) || 0,
    description: trip?.description,
    itinerary: Array.isArray(trip?.itinerary) ? trip.itinerary : [],
    inclusions: Array.isArray(trip?.inclusions) ? trip.inclusions : [],
    exclusions: Array.isArray(trip?.exclusions) ? trip.exclusions : [],
    cancellationPolicy: trip?.cancellationPolicy,
    refundPolicy: trip?.refundPolicy,
    minimumGroupSize: trip?.minimumGroupSize,
    requirements: trip?.requirements,
    importantNotes: trip?.importantNotes,
  };
};

const mapBackendTripToMapTrip = (trip: any): MapTrip | null => {
  const latitude = Number(trip?.location?.latitude);
  const longitude = Number(trip?.location?.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const category =
    typeof trip?.category === "string" && trip.category.trim() !== ""
      ? trip.category.toLowerCase()
      : "other";

  return {
    id: String(trip?._id || ""),
    name:
      typeof trip?.title === "string" && trip.title.trim() !== ""
        ? trip.title
        : "Untitled Trip",
    destination:
      typeof trip?.location?.name === "string" && trip.location.name.trim() !== ""
        ? trip.location.name
        : [trip?.destination, trip?.country].filter(Boolean).join(", "),
    category,
    duration: getDurationLabel(trip?.startDate, trip?.endDate),
    priceRange: `${formatPrice(Number(trip?.priceMin) || 0)} - ${formatPrice(
      Number(trip?.priceMax) || 0
    )}`,
    organizerName:
      trip?.organizer?.fullName ||
      trip?.organizer?.organizationName ||
      trip?.organizer?.userId ||
      "Organizer",
    image:
      typeof trip?.coverImage === "string" && trip.coverImage.trim() !== ""
        ? trip.coverImage
        : FALLBACK_TRIP_IMAGE,
    coordinates: [latitude, longitude],
    detailTrip: mapBackendTripToDetailTrip(trip),
  };
};

/* ---------------- COMPONENT ---------------- */

interface MapsPageProps {
  isDark: boolean;
  toggleTheme: () => void;
  onNavigate: (page: string) => void;
  onViewTripDetail?: (trip: Trip) => void;
}

export function MapsPage({
  isDark,
  toggleTheme,
  onNavigate,
  onViewTripDetail,
}: MapsPageProps) {
  const [trips, setTrips] = useState<MapTrip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<MapTrip | null>(null);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    destination: "",
    category: "all",
    budgetMin: 0,
    budgetMax: 5000,
    duration: "all",
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/trips?summary=true`);
        if (!response.ok) {
          throw new Error(`Failed to fetch trips (${response.status})`);
        }

        const data = await response.json();
        const backendTrips = Array.isArray(data?.data?.trips) ? data.data.trips : [];
        const mappedTrips = backendTrips
          .map((trip: any) => mapBackendTripToMapTrip(trip))
          .filter((trip): trip is TripData => trip !== null);

        setTrips(mappedTrips);
      } catch (error) {
        console.error("Error fetching map trips:", error);
        setTrips([]);
      } finally {
        setIsLoadingTrips(false);
      }
    };

    fetchTrips();
  }, []);

  /* ---------------- FILTER LOGIC ---------------- */

  const filteredTrips = trips.filter((trip) => {
    if (
      filters.destination &&
      !trip.destination
        .toLowerCase()
        .includes(filters.destination.toLowerCase())
    ) {
      return false;
    }
    if (filters.category !== "all" && trip.category !== filters.category) {
      return false;
    }
    return true;
  });

  const getIcon = (category: string) => {
    switch (category) {
      case "beach":
        return beachIcon;
      case "hills":
        return hillsIcon;
      case "adventure":
        return adventureIcon;
      case "cultural":
        return culturalIcon;
      default:
        return beachIcon;
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-50 dark:bg-slate-950">
      <LeftNav activePage="maps" onNavigate={onNavigate} />
      <TopBar isDark={isDark} toggleTheme={toggleTheme} />

      <div className="flex-1 lg:ml-64 pt-16 flex overflow-hidden">
        {/* LEFT FILTER PANEL */}
        <div className="hidden lg:block w-80 border-r border-slate-200 dark:border-slate-800">
          <MapFilters onFilterChange={setFilters} />
        </div>

        {/* MAP SECTION */}
        <div className="flex-1 relative">
          {/* MOBILE FILTER BUTTON */}
          <button
            onClick={() => setShowFilters(true)}
            className="lg:hidden absolute top-4 left-4 z-[1000] px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg flex items-center gap-2"
          >
            <SlidersHorizontal className="size-5" />
            Filters
          </button>

          <MapContainer
            center={[20, 0]}
            zoom={2}
            minZoom={2}
            maxZoom={10}
            maxBounds={[
              [-85, -180],
              [85, 180],
            ]}
            maxBoundsViscosity={1.0}
            worldCopyJump={false}
            scrollWheelZoom={true}
            dragging={true}
            doubleClickZoom={true}
            touchZoom={true}
            keyboard={true}
            style={{ height: "100vh", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              noWrap={true}
              attribution="&copy; OpenStreetMap"
            />

            {filteredTrips.map((trip) => (
              <Marker
                key={trip.id}
                position={[trip.coordinates[0], trip.coordinates[1]]}
                icon={getIcon(trip.category)}
                eventHandlers={{
                  click: () => {
                    setSelectedTrip(trip);
                  },
                }}
              />
            ))}
          </MapContainer>

          {selectedTrip && (
            <div className="absolute inset-0 z-[1100] flex items-center justify-center p-4 pointer-events-none">
              <div className="pointer-events-auto">
                <TripPreviewPopup
                  trip={selectedTrip}
                  onClose={() => setSelectedTrip(null)}
                  onViewDetails={() => {
                    setSelectedTrip(null);
                    if (onViewTripDetail) {
                      onViewTripDetail(selectedTrip.detailTrip);
                      return;
                    }
                    onNavigate("trips");
                  }}
                />
              </div>
            </div>
          )}

          {/* BOTTOM STATUS */}
          <div className="absolute bottom-4 left-4 z-[1000] px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
            {isLoadingTrips ? (
              <span className="font-semibold text-teal-600">Loading trips...</span>
            ) : (
              <>
                <span className="font-semibold text-teal-600">
                  {filteredTrips.length}
                </span>{" "}
                trips available
              </>
            )}
          </div>
        </div>
      </div>

      <BottomNav activePage="maps" onNavigate={onNavigate} />
    </div>
  );
}
