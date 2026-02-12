import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

import { LeftNav } from "../home/LeftNav";
import { TopBar } from "../home/TopBar";
import { BottomNav } from "../home/BottomNav";
import { MapFilters, Filters } from "./MapFilters";
import { TripPreviewPopup, TripData } from "./TripPreviewPopup";
import { SlidersHorizontal } from "lucide-react";

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

/* ---------------- MOCK DATA ---------------- */

const mockTrips: TripData[] = [
  {
    id: "1",
    name: "Santorini Sunset Experience",
    destination: "Santorini, Greece",
    category: "beach",
    duration: "5 days",
    priceRange: "$1,200 - $1,800",
    organizerName: "Nomad Adventures",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600",
    coordinates: [36.3932, 25.4615],
  },
  {
    id: "2",
    name: "Himalayan Trek",
    destination: "Manali, India",
    category: "hills",
    duration: "7 days",
    priceRange: "$800 - $1,200",
    organizerName: "Mountain Explorers",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
    coordinates: [32.2432, 77.1892],
  },
];

/* ---------------- COMPONENT ---------------- */

interface MapsPageProps {
  isDark: boolean;
  toggleTheme: () => void;
  onNavigate: (page: string) => void;
  onViewTripDetail?: (tripId: string) => void;
}

export function MapsPage({
  isDark,
  toggleTheme,
  onNavigate,
  onViewTripDetail,
}: MapsPageProps) {
  const [filters, setFilters] = useState<Filters>({
    destination: "",
    category: "all",
    budgetMin: 0,
    budgetMax: 5000,
    duration: "all",
  });

  const [showFilters, setShowFilters] = useState(false);

  /* ---------------- FILTER LOGIC ---------------- */

  const filteredTrips = mockTrips.filter((trip) => {
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
              >
                <Popup>
                  <TripPreviewPopup
                    trip={trip}
                    onViewDetails={() =>
                      onViewTripDetail
                        ? onViewTripDetail(trip.id)
                        : onNavigate("trips")
                    }
                  />
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* BOTTOM STATUS */}
          <div className="absolute bottom-4 left-4 z-[1000] px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
            <span className="font-semibold text-teal-600">
              {filteredTrips.length}
            </span>{" "}
            trips available
          </div>
        </div>
      </div>

      <BottomNav activePage="maps" onNavigate={onNavigate} />
    </div>
  );
}
