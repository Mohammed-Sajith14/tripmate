import { MapPin, Clock, DollarSign, User } from "lucide-react";

export interface TripData {
  id: string;
  name: string;
  destination: string;
  category: string;
  duration: string;
  priceRange: string;
  organizerName: string;
  image: string;
  coordinates: [number, number];
}

interface TripPreviewPopupProps {
  trip: TripData;
  onViewDetails: () => void;
}

export function TripPreviewPopup({ trip, onViewDetails }: TripPreviewPopupProps) {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "beach":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "hills":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "adventure":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400";
      case "cultural":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Image */}
      <div className="aspect-video relative">
        <img
          src={trip.image}
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        <span
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
            trip.category
          )}`}
        >
          {trip.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Trip Name */}
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
            {trip.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <MapPin className="size-3.5" />
            {trip.destination}
          </p>
        </div>

        {/* Trip Info */}
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="size-4" />
            <span>{trip.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="size-4" />
            <span>{trip.priceRange}</span>
          </div>
        </div>

        {/* Organizer */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <User className="size-4 text-slate-400" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            by {trip.organizerName}
          </span>
        </div>

        {/* View Details Button */}
        <button
          onClick={onViewDetails}
          className="w-full px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
