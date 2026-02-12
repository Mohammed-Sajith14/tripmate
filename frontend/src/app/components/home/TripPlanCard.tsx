import { Calendar, MapPin, Tag } from "lucide-react";

interface TripPlanCardProps {
  destination: string;
  image: string;
  month: string;
  category: string;
  organizerName: string;
  organizerUserId: string;
}

export function TripPlanCard({
  destination,
  image,
  month,
  category,
  organizerName,
  organizerUserId,
}: TripPlanCardProps) {
  return (
    <div className="flex-shrink-0 w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all hover:border-teal-500 dark:hover:border-teal-500 cursor-pointer group">
      {/* Image */}
      <div className="aspect-[3/2] bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
        <img
          src={image}
          alt={destination}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Category Badge */}
        <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Destination */}
        <div className="flex items-start gap-2 mb-3">
          <MapPin className="size-5 text-teal-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white text-lg truncate">
              {destination}
            </h3>
          </div>
        </div>

        {/* Month */}
        <div className="flex items-center gap-2 mb-3 text-sm text-slate-600 dark:text-slate-400">
          <Calendar className="size-4" />
          <span>{month}</span>
        </div>

        {/* Organizer */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="size-6 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center">
            <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
              {organizerUserId.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
            by {organizerName}
          </span>
        </div>

        {/* CTA */}
        <button className="w-full mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-medium hover:bg-teal-500 hover:text-white dark:hover:bg-teal-500 transition-colors">
          View details
        </button>
      </div>
    </div>
  );
}
