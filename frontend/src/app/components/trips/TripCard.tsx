import { Calendar, MapPin, Users, Star, DollarSign } from "lucide-react";
import { Trip } from "./TripsPage";

interface TripCardProps {
  trip: Trip;
  onViewDetails?: (trip: Trip) => void;
}

export function TripCard({ trip, onViewDetails }: TripCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatBudget = (min: number, max: number) => {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 transition-all hover:shadow-lg group">
      {/* Trip Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={trip.image}
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-full text-sm font-medium text-slate-900 dark:text-white">
            {trip.category}
          </span>
        </div>

        {/* Availability Badge */}
        {trip.availableSpots <= 3 && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-medium">
              Only {trip.availableSpots} spots left
            </span>
          </div>
        )}
      </div>

      {/* Trip Details */}
      <div className="p-5">
        {/* Title and Location */}
        <div className="mb-3">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1 line-clamp-1">
            {trip.title}
          </h3>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <MapPin className="size-4 flex-shrink-0" />
            <span className="text-sm">{trip.destination}, {trip.country}</span>
          </div>
        </div>

        {/* Trip Info Grid */}
        <div className="space-y-2.5 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          {/* Duration */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="size-4 text-slate-400 flex-shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">
              {trip.duration} {trip.duration === 1 ? 'day' : 'days'}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 dark:text-slate-400">
              {formatDate(trip.startDate)}
            </span>
          </div>

          {/* Budget */}
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="size-4 text-slate-400 flex-shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">
              {formatBudget(trip.budgetMin, trip.budgetMax)}
            </span>
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`size-2 rounded-full flex-shrink-0 ${
              trip.difficulty === 'Easy' 
                ? 'bg-green-500' 
                : trip.difficulty === 'Moderate' 
                ? 'bg-yellow-500' 
                : 'bg-orange-500'
            }`} />
            <span className="text-slate-700 dark:text-slate-300">
              {trip.difficulty}
            </span>
          </div>
        </div>

        {/* Organizer Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">
                {trip.organizerName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {trip.organizerName}
              </p>
              <div className="flex items-center gap-1">
                <Star className="size-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {trip.organizerRating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Available Spots */}
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 flex-shrink-0">
            <Users className="size-4" />
            <span className="text-sm">{trip.availableSpots}/{trip.totalSpots}</span>
          </div>
        </div>

        {/* View Details Button */}
        <button className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-500 dark:hover:bg-teal-500 text-slate-900 dark:text-white hover:text-white rounded-lg font-medium transition-all group-hover:shadow-md"
          onClick={() => onViewDetails && onViewDetails(trip)}
        >
          View Details
        </button>
      </div>
    </div>
  );
}