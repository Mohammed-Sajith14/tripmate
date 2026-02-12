import { useState } from "react";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { TripFormData, DayItinerary } from "./CreateTripPage";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface ItineraryBuilderProps {
  register: UseFormRegister<TripFormData>;
  setValue: UseFormSetValue<TripFormData>;
  watch: UseFormWatch<TripFormData>;
}

export function ItineraryBuilder({
  register,
  setValue,
  watch,
}: ItineraryBuilderProps) {
  const itinerary = watch("itinerary") || [{ day: 1, title: "", description: "" }];
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0]));

  const addDay = () => {
    const newDay: DayItinerary = {
      day: itinerary.length + 1,
      title: "",
      description: "",
    };
    setValue("itinerary", [...itinerary, newDay]);
    setExpandedDays(new Set([...expandedDays, itinerary.length]));
  };

  const removeDay = (index: number) => {
    if (itinerary.length === 1) return; // Keep at least one day
    const newItinerary = itinerary.filter((_, i) => i !== index);
    // Renumber days
    const renumbered = newItinerary.map((day, i) => ({ ...day, day: i + 1 }));
    setValue("itinerary", renumbered);

    // Update expanded days
    const newExpanded = new Set<number>();
    expandedDays.forEach((dayIndex) => {
      if (dayIndex < index) newExpanded.add(dayIndex);
      else if (dayIndex > index) newExpanded.add(dayIndex - 1);
    });
    setExpandedDays(newExpanded);
  };

  const toggleDay = (index: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedDays(newExpanded);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            Day-by-Day Itinerary
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Build a detailed schedule for your trip
          </p>
        </div>
        <button
          type="button"
          onClick={addDay}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Day
        </button>
      </div>

      <div className="space-y-3">
        {itinerary.map((day, index) => {
          const isExpanded = expandedDays.has(index);

          return (
            <div
              key={index}
              className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
            >
              {/* Day Header */}
              <div
                onClick={() => toggleDay(index)}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-semibold">
                    {day.day}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {day.title || `Day ${day.day}`}
                    </p>
                    {!isExpanded && day.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-md">
                        {day.description.substring(0, 60)}
                        {day.description.length > 60 ? "..." : ""}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {itinerary.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDay(index);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Day Content */}
              {isExpanded && (
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Day Title
                    </label>
                    <input
                      type="text"
                      {...register(`itinerary.${index}.title` as const)}
                      placeholder="e.g., Temple Exploration & Tea Ceremony"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Activities & Description
                    </label>
                    <textarea
                      {...register(`itinerary.${index}.description` as const)}
                      rows={4}
                      placeholder="Describe the day's activities, meals, and experiences..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {itinerary.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            No days added yet. Click "Add Day" to start building your itinerary.
          </p>
        </div>
      )}
    </div>
  );
}
