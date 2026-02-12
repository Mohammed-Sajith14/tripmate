import { Plus, X } from "lucide-react";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { TripFormData } from "./CreateTripPage";

interface InclusionsSectionProps {
  register: UseFormRegister<TripFormData>;
  setValue: UseFormSetValue<TripFormData>;
  watch: UseFormWatch<TripFormData>;
}

export function InclusionsSection({
  register,
  setValue,
  watch,
}: InclusionsSectionProps) {
  const inclusions = watch("inclusions") || [""];
  const exclusions = watch("exclusions") || [""];

  const addInclusion = () => {
    setValue("inclusions", [...inclusions, ""]);
  };

  const removeInclusion = (index: number) => {
    setValue(
      "inclusions",
      inclusions.filter((_, i) => i !== index)
    );
  };

  const addExclusion = () => {
    setValue("exclusions", [...exclusions, ""]);
  };

  const removeExclusion = (index: number) => {
    setValue(
      "exclusions",
      exclusions.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
        Inclusions & Exclusions
      </h2>

      {/* Inclusions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            What's Included
          </label>
          <button
            type="button"
            onClick={addInclusion}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
        <div className="space-y-3">
          {inclusions.map((_, index) => (
            <div key={index} className="flex gap-2">
              <input
                {...register(`inclusions.${index}` as const)}
                type="text"
                placeholder="e.g., Accommodation, Meals, Transportation"
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
              {inclusions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInclusion(index)}
                  className="p-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Exclusions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            What's Not Included
          </label>
          <button
            type="button"
            onClick={addExclusion}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
        <div className="space-y-3">
          {exclusions.map((_, index) => (
            <div key={index} className="flex gap-2">
              <input
                {...register(`exclusions.${index}` as const)}
                type="text"
                placeholder="e.g., Personal expenses, Travel insurance, Visa fees"
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
              {exclusions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExclusion(index)}
                  className="p-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
