import { MapPin, Briefcase, Globe, User } from "lucide-react";

interface ContextPanelProps {
  type: "organizer" | "traveler";
  data: {
    userId: string;
    name: string;
    role: string;
    bio?: string;
    location?: string;
    organizationName?: string;
    organizationDescription?: string;
  };
  tripContext?: {
    tripName: string;
    destination: string;
    image: string;
  } | null;
  onViewProfile: () => void;
  onViewTrip?: () => void;
}

export function ContextPanel({
  type,
  data,
  tripContext,
  onViewProfile,
  onViewTrip,
}: ContextPanelProps) {
  return (
    <div className="h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Profile Section */}
        <div className="text-center">
          <div className="size-24 mx-auto rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-white">
              {data.userId.charAt(0).toUpperCase()}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            {data.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            @{data.userId}
          </p>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
              type === "organizer"
                ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            {type === "organizer" ? <Briefcase className="size-3" /> : <User className="size-3" />}
            {data.role}
          </span>
        </div>

        {/* Organizer-Specific Information */}
        {type === "organizer" && (
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            {data.organizationName && (
              <div className="flex items-start gap-3">
                <Briefcase className="size-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Organization
                  </p>
                  <p className="text-sm text-slate-900 dark:text-white font-medium">
                    {data.organizationName}
                  </p>
                </div>
              </div>
            )}
            {data.location && (
              <div className="flex items-start gap-3">
                <MapPin className="size-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Location
                  </p>
                  <p className="text-sm text-slate-900 dark:text-white">
                    {data.location}
                  </p>
                </div>
              </div>
            )}
            {data.organizationDescription && (
              <div className="flex items-start gap-3">
                <Globe className="size-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    About
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {data.organizationDescription}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Traveler-Specific Information */}
        {type === "traveler" && data.bio && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              About
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {data.bio}
            </p>
          </div>
        )}

        {/* Trip Context (if applicable) */}
        {tripContext && (
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={tripContext.image}
                alt={tripContext.tripName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Regarding Trip
              </p>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                {tripContext.tripName}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="size-3" />
                {tripContext.destination}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onViewProfile}
            className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
          >
            View Profile
          </button>
          {tripContext && onViewTrip && (
            <button
              onClick={onViewTrip}
              className="w-full px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
            >
              View Trip Details
            </button>
          )}
        </div>

        {/* Trust Notice */}
        <div className="p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 rounded-xl">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong className="text-slate-900 dark:text-white">Trust & Safety:</strong>{" "}
            {type === "organizer"
              ? "This is a verified organizer on Trip Mate. Always communicate through the platform for your safety."
              : "Keep all communication on Trip Mate for your security and protection."}
          </p>
        </div>
      </div>
    </div>
  );
}
