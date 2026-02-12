import { UseFormRegister, FieldErrors } from "react-hook-form";
import { TripFormData } from "./CreateTripPage";

interface PoliciesSectionProps {
  register: UseFormRegister<TripFormData>;
  errors: FieldErrors<TripFormData>;
}

export function PoliciesSection({ register, errors }: PoliciesSectionProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
        Policies & Requirements
      </h2>

      <div className="space-y-6">
        {/* Cancellation Policy */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Cancellation Policy <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("cancellationPolicy", {
              required: "Cancellation policy is required",
            })}
            rows={4}
            placeholder="Describe your cancellation and refund terms..."
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
          />
          {errors.cancellationPolicy && (
            <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {errors.cancellationPolicy.message}
            </p>
          )}
        </div>

        {/* Refund Policy */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Refund Policy <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("refundPolicy", {
              required: "Refund policy is required",
            })}
            rows={3}
            placeholder="Explain your refund process and timeline..."
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
          />
          {errors.refundPolicy && (
            <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {errors.refundPolicy.message}
            </p>
          )}
        </div>

        {/* Minimum Group Size */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Minimum Group Size <span className="text-red-500">*</span>
          </label>
          <input
            {...register("minimumGroupSize", {
              required: "Minimum group size is required",
              min: { value: 1, message: "Minimum must be at least 1" },
              valueAsNumber: true,
            })}
            type="number"
            min="1"
            placeholder="e.g., 4"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
          {errors.minimumGroupSize && (
            <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {errors.minimumGroupSize.message}
            </p>
          )}
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Trip will only proceed if minimum participants are met
          </p>
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Requirements & Eligibility
          </label>
          <textarea
            {...register("requirements")}
            rows={3}
            placeholder="Age restrictions, fitness level, required documents, etc."
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
          />
        </div>

        {/* Important Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Important Notes
          </label>
          <textarea
            {...register("importantNotes")}
            rows={3}
            placeholder="Any additional information travelers should know..."
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
