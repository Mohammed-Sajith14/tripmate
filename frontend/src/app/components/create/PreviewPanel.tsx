import { TripFormData } from "./CreateTripPage";
import { Calendar, MapPin, Users, DollarSign } from "lucide-react";

interface PreviewPanelProps {
  formData: Partial<TripFormData>;
}

export function PreviewPanel({ formData }: PreviewPanelProps) {
  const hasBasicInfo =
    formData.title || formData.destination || formData.startDate || formData.endDate;
  const hasPricing = formData.priceMin || formData.priceMax;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Preview Header */}
      <div className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500">
        <h3 className="font-semibold text-white">Trip Preview</h3>
        <p className="text-xs text-teal-50 mt-1">
          This is how your trip will appear to travelers
        </p>
      </div>

      {/* Preview Content */}
      <div className="p-4">
        {!hasBasicInfo && !hasPricing ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Start filling in the form to see a preview
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cover Image Preview */}
            {formData.coverImage ? (
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                {typeof formData.coverImage === "string" ? (
                  <img
                    src={formData.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-slate-500">
                    Image uploaded
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-700" />
              </div>
            )}

            {/* Title & Destination */}
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-lg line-clamp-2">
                {formData.title || "Trip Title"}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {formData.destination
                  ? `${formData.destination}${formData.country ? `, ${formData.country}` : ""}`
                  : "Destination"}
              </p>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-3">
              {/* Dates */}
              <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">Dates</span>
                </div>
                <p className="text-sm text-slate-900 dark:text-white font-medium">
                  {formData.startDate
                    ? new Date(formData.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "Start"}{" "}
                  -{" "}
                  {formData.endDate
                    ? new Date(formData.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "End"}
                </p>
              </div>

              {/* Group Size */}
              <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">Spots</span>
                </div>
                <p className="text-sm text-slate-900 dark:text-white font-medium">
                  {formData.totalSpots || "0"} available
                </p>
              </div>
            </div>

            {/* Price */}
            {hasPricing && (
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-lg p-4 border border-teal-100 dark:border-teal-900">
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-medium">Price Range</span>
                </div>
                <p className="text-lg font-bold text-teal-900 dark:text-teal-300">
                  ${formData.priceMin || "0"} - ${formData.priceMax || "0"}
                </p>
                <p className="text-xs text-teal-600 dark:text-teal-500 mt-1">
                  per person
                </p>
              </div>
            )}

            {/* Category & Difficulty */}
            <div className="flex gap-2 flex-wrap">
              {formData.category && (
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-full">
                  {formData.category}
                </span>
              )}
              {formData.difficulty && (
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-full">
                  {formData.difficulty}
                </span>
              )}
            </div>

            {/* Description Preview */}
            {formData.description && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                  {formData.description}
                </p>
              </div>
            )}

            {/* Itinerary Preview */}
            {formData.itinerary && formData.itinerary.length > 0 && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Itinerary ({formData.itinerary.length} days)
                </p>
                <div className="space-y-2">
                  {formData.itinerary.slice(0, 3).map((day, index) => (
                    <div
                      key={index}
                      className="text-sm bg-slate-50 dark:bg-slate-950 rounded-lg p-2"
                    >
                      <p className="font-medium text-slate-900 dark:text-white text-xs">
                        Day {day.day}: {day.title || "Untitled"}
                      </p>
                      {day.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
                          {day.description}
                        </p>
                      )}
                    </div>
                  ))}
                  {formData.itinerary.length > 3 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                      +{formData.itinerary.length - 3} more days
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
