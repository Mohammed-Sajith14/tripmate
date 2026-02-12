import { UseFormRegister, FieldErrors } from "react-hook-form";
import { TripFormData } from "./CreateTripPage";
import { DollarSign, Users, Calendar } from "lucide-react";

interface PricingSectionProps {
  register: UseFormRegister<TripFormData>;
  errors: FieldErrors<TripFormData>;
}

export function PricingSection({ register, errors }: PricingSectionProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
        Pricing & Capacity
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Set your pricing and availability
      </p>

      <div className="space-y-5">
        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Price per Person (USD) <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  {...register("priceMin", {
                    required: "Minimum price is required",
                    min: { value: 1, message: "Price must be at least $1" },
                    valueAsNumber: true,
                  })}
                  placeholder="Min"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
              {errors.priceMin && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.priceMin.message}
                </p>
              )}
            </div>
            <div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  {...register("priceMax", {
                    required: "Maximum price is required",
                    min: { value: 1, message: "Price must be at least $1" },
                    valueAsNumber: true,
                  })}
                  placeholder="Max"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
              {errors.priceMax && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.priceMax.message}
                </p>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Provide a price range if costs vary by accommodation or options
          </p>
        </div>

        {/* Total Available Spots */}
        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Total Available Spots <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="number"
              {...register("totalSpots", {
                required: "Total spots is required",
                min: { value: 1, message: "At least 1 spot required" },
                valueAsNumber: true,
              })}
              placeholder="e.g., 12"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
          {errors.totalSpots && (
            <p className="mt-1.5 text-sm text-red-500">
              {errors.totalSpots.message}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Maximum number of travelers for this trip
          </p>
        </div>

        {/* Booking Deadline (Optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Booking Deadline <span className="text-slate-400">(Optional)</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="date"
              {...register("bookingDeadline")}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
            />
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Last date to accept bookings (defaults to start date if not set)
          </p>
        </div>
      </div>
    </div>
  );
}
