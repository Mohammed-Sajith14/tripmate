import { useEffect, useState } from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { TripFormData } from "./CreateTripPage";
import { API_BASE_URL } from "../../../utils/auth";

interface LocationSuggestion {
  name: string;
  latitude: number;
  longitude: number;
}

interface BasicInfoSectionProps {
  register: UseFormRegister<TripFormData>;
  setValue: UseFormSetValue<TripFormData>;
  watch: UseFormWatch<TripFormData>;
  errors: FieldErrors<TripFormData>;
}

export function BasicInfoSection({ register, setValue, watch, errors }: BasicInfoSectionProps) {
  const categories = [
    "Beach",
    "Hills",
    "Adventure",
    "Cultural",
    "Wildlife",
    "City Break",
    "Road Trip",
    "Cruise",
  ];

  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoadingLocationSuggestions, setIsLoadingLocationSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationValue = watch("location") || "";
  const locationField = register("location", {
    required: "Exact location is required",
  });

  useEffect(() => {
    const query = locationValue.trim();

    if (query.length < 2) {
      setLocationSuggestions([]);
      setIsLoadingLocationSuggestions(false);
      return;
    }

    const abortController = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsLoadingLocationSuggestions(true);

        const response = await fetch(
          `${API_BASE_URL}/trips/locations/suggest?q=${encodeURIComponent(query)}`,
          { signal: abortController.signal }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch locations (${response.status})`);
        }

        const data = await response.json();
        const suggestions = Array.isArray(data?.data?.locations)
          ? data.data.locations
          : [];

        setLocationSuggestions(suggestions);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Location suggestions error:", error);
          setLocationSuggestions([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingLocationSuggestions(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [locationValue]);

  const handleSelectLocation = (locationName: string) => {
    setValue("location", locationName, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
        Basic Trip Information
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Essential details about your trip
      </p>

      <div className="space-y-5">
        {/* Trip Title */}
        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Trip Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("title", { required: "Trip title is required" })}
            placeholder="e.g., Kyoto Temple Discovery"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          {errors.title && (
            <p className="mt-1.5 text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Destination & Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Destination (City) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("destination", {
                required: "Destination is required",
              })}
              placeholder="e.g., Kyoto"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            {errors.destination && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.destination.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("country", { required: "Country is required" })}
              placeholder="e.g., Japan"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            {errors.country && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.country.message}
              </p>
            )}
          </div>
        </div>

        {/* Exact Location */}
        <div className="relative">
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Exact Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...locationField}
            value={locationValue}
            onFocus={() => setShowLocationSuggestions(true)}
            onChange={(event) => {
              locationField.onChange(event);
              setShowLocationSuggestions(true);
            }}
            onBlur={(event) => {
              locationField.onBlur(event);
              window.setTimeout(() => setShowLocationSuggestions(false), 150);
            }}
            placeholder="e.g., Kiyomizu-dera Temple, Kyoto"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          {showLocationSuggestions && (isLoadingLocationSuggestions || locationValue.trim().length >= 2) && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
              {isLoadingLocationSuggestions ? (
                <p className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">Searching locations...</p>
              ) : locationSuggestions.length > 0 ? (
                <div className="max-h-60 overflow-y-auto">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.name}-${index}`}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelectLocation(suggestion.name)}
                      className="w-full px-4 py-3 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      {suggestion.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">No matching locations found</p>
              )}
            </div>
          )}
          {errors.location && (
            <p className="mt-1.5 text-sm text-red-500">{errors.location.message}</p>
          )}
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Use a specific place name or address so your trip can be pinned on the map.
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            {...register("category", { required: "Category is required" })}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1.5 text-sm text-red-500">
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Start Date & End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register("startDate", { required: "Start date is required" })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
            />
            {errors.startDate && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register("endDate", { required: "End date is required" })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
            />
            {errors.endDate && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          <span className="text-red-500">*</span> Required fields
        </p>
      </div>
    </div>
  );
}
