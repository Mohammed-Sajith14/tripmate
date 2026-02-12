import { UseFormRegister, FieldErrors } from "react-hook-form";
import { TripFormData } from "./CreateTripPage";
import { FileText } from "lucide-react";

interface DescriptionSectionProps {
  register: UseFormRegister<TripFormData>;
  errors: FieldErrors<TripFormData>;
}

export function DescriptionSection({
  register,
  errors,
}: DescriptionSectionProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
        Trip Description
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Tell travelers what makes this trip special
      </p>

      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          About This Trip <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("description", {
            required: "Trip description is required",
            minLength: {
              value: 100,
              message: "Description should be at least 100 characters",
            },
          })}
          rows={8}
          placeholder="Describe your trip in detail. Include:&#10;• Purpose of the trip&#10;• Ideal traveler type&#10;• Key highlights and experiences&#10;• What makes this trip unique"
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
        />
        {errors.description && (
          <p className="mt-1.5 text-sm text-red-500">
            {errors.description.message}
          </p>
        )}

        {/* Helper Guidelines */}
        <div className="mt-4 p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50 rounded-lg">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-teal-900 dark:text-teal-100 space-y-2">
              <p className="font-medium">Writing Guidelines:</p>
              <ul className="space-y-1 text-teal-800 dark:text-teal-200">
                <li>• Be specific and honest about what travelers will experience</li>
                <li>• Mention who this trip is best suited for</li>
                <li>• Highlight unique selling points</li>
                <li>• Keep language clear and professional</li>
                <li>• Avoid overpromising or using excessive marketing language</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
