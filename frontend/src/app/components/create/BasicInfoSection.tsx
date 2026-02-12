import { UseFormRegister, FieldErrors } from "react-hook-form";
import { TripFormData } from "./CreateTripPage";

interface BasicInfoSectionProps {
  register: UseFormRegister<TripFormData>;
  errors: FieldErrors<TripFormData>;
}

export function BasicInfoSection({ register, errors }: BasicInfoSectionProps) {
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

  const difficultyLevels = ["Easy", "Moderate", "Challenging", "Extreme"];

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

        {/* Category & Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Difficulty Level <span className="text-red-500">*</span>
            </label>
            <select
              {...register("difficulty", {
                required: "Difficulty level is required",
              })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
            >
              <option value="">Select difficulty</option>
              {difficultyLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            {errors.difficulty && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.difficulty.message}
              </p>
            )}
          </div>
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
