import { useState } from "react";
import { useForm } from "react-hook-form";
import { LeftNav } from "../home/LeftNav";
import { TopBar } from "../home/TopBar";
import { BottomNav } from "../home/BottomNav";
import { BasicInfoSection } from "./BasicInfoSection";
import { PricingSection } from "./PricingSection";
import { MediaSection } from "./MediaSection";
import { DescriptionSection } from "./DescriptionSection";
import { ItineraryBuilder } from "./ItineraryBuilder";
import { InclusionsSection } from "./InclusionsSection";
import { PoliciesSection } from "./PoliciesSection";
import { PreviewPanel } from "./PreviewPanel";
import { PostCreationPage } from "../social/PostCreationPage";
import { Eye, Save, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface CreateTripPageProps {
  isDark: boolean;
  toggleTheme: () => void;
  onNavigate: (page: string) => void;
  userType?: "traveler" | "organizer";
}

export interface DayItinerary {
  day: number;
  title: string;
  description: string;
}

export interface TripFormData {
  // Basic Info
  title: string;
  destination: string;
  country: string;
  category: string;
  difficulty: string;
  startDate: string;
  endDate: string;

  // Pricing & Capacity
  priceMin: number;
  priceMax: number;
  totalSpots: number;
  bookingDeadline?: string;

  // Media
  coverImage?: File | string;
  galleryImages?: (File | string)[];

  // Description
  description: string;

  // Itinerary
  itinerary: DayItinerary[];

  // Inclusions
  inclusions: string[];
  exclusions: string[];

  // Policies
  cancellationPolicy: string;
  refundPolicy: string;
  minimumGroupSize: number;
  requirements: string;
  importantNotes: string;
}

export function CreateTripPage({
  isDark,
  toggleTheme,
  onNavigate,
  userType = "organizer",
}: CreateTripPageProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TripFormData>({
    defaultValues: {
      itinerary: [{ day: 1, title: "", description: "" }],
      inclusions: [""],
      exclusions: [""],
      minimumGroupSize: 1,
    },
  });

  const formData = watch();

  // Route travelers to Post Creation Page
  if (userType === "traveler") {
    return (
      <PostCreationPage
        isDark={isDark}
        toggleTheme={toggleTheme}
        onNavigate={onNavigate}
      />
    );
  }

  const onSubmitPublish = async (data: TripFormData) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Convert File objects to base64 strings
      let coverImageBase64 = data.coverImage;
      let galleryImagesBase64 = data.galleryImages || [];

      if (data.coverImage && data.coverImage instanceof File) {
        coverImageBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(data.coverImage as File);
        });
      }

      if (data.galleryImages && data.galleryImages.length > 0) {
        galleryImagesBase64 = await Promise.all(
          data.galleryImages.map((img) => {
            if (img instanceof File) {
              return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(img);
              });
            }
            return Promise.resolve(img as string);
          })
        );
      }
      
      const response = await fetch('http://localhost:5000/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.title,
          destination: data.destination,
          country: data.country,
          category: data.category,
          difficulty: data.difficulty,
          startDate: data.startDate,
          endDate: data.endDate,
          priceMin: data.priceMin,
          priceMax: data.priceMax,
          totalSpots: data.totalSpots,
          bookingDeadline: data.bookingDeadline,
          coverImage: coverImageBase64,
          galleryImages: galleryImagesBase64,
          description: data.description,
          itinerary: data.itinerary,
          inclusions: data.inclusions,
          exclusions: data.exclusions,
          cancellationPolicy: data.cancellationPolicy,
          refundPolicy: data.refundPolicy,
          minimumGroupSize: data.minimumGroupSize,
          requirements: data.requirements,
          importantNotes: data.importantNotes,
        }),
      });

      if (response.ok) {
        toast.success("Trip published successfully!");
        onNavigate("trips");
      } else {
        const error = await response.json();
        console.error('Backend error:', error);
        toast.error(error.message || 'Failed to publish trip');
      }
    } catch (error) {
      console.error('Error publishing trip:', error);
      toast.error("Failed to publish trip. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const onSaveDraft = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Convert File objects to base64 strings
      let coverImageBase64 = formData.coverImage;
      let galleryImagesBase64 = formData.galleryImages || [];

      if (formData.coverImage && formData.coverImage instanceof File) {
        coverImageBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(formData.coverImage as File);
        });
      }

      if (formData.galleryImages && formData.galleryImages.length > 0) {
        galleryImagesBase64 = await Promise.all(
          formData.galleryImages.map((img) => {
            if (img instanceof File) {
              return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(img);
              });
            }
            return Promise.resolve(img as string);
          })
        );
      }
      
      const response = await fetch('http://localhost:5000/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          destination: formData.destination,
          country: formData.country,
          category: formData.category,
          difficulty: formData.difficulty,
          startDate: formData.startDate,
          endDate: formData.endDate,
          priceMin: formData.priceMin,
          priceMax: formData.priceMax,
          totalSpots: formData.totalSpots,
          bookingDeadline: formData.bookingDeadline,
          coverImage: coverImageBase64,
          galleryImages: galleryImagesBase64,
          description: formData.description,
          itinerary: formData.itinerary,
          inclusions: formData.inclusions,
          exclusions: formData.exclusions,
          cancellationPolicy: formData.cancellationPolicy,
          refundPolicy: formData.refundPolicy,
          minimumGroupSize: formData.minimumGroupSize,
          requirements: formData.requirements,
          importantNotes: formData.importantNotes,
        }),
      });

      if (response.ok) {
        toast.success("Draft saved successfully!");
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error("Failed to save draft. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Bar - Mobile */}
      <div className="lg:hidden">
        <TopBar isDark={isDark} toggleTheme={toggleTheme} />
      </div>

      <div className="flex">
        {/* Left Navigation - Desktop */}
        <div className="hidden lg:block">
          <LeftNav
            activePage="create"
            onNavigate={onNavigate}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 pb-20 lg:pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {/* Page Header */}
            <div className="mb-8">
              <button
                onClick={() => onNavigate("trips")}
                className="flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 mb-4 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Trips
              </button>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Create New Trip
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Provide accurate details to help travelers make informed decisions.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmitPublish)}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Sections - Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Trip Information */}
                  <BasicInfoSection register={register} errors={errors} />

                  {/* Pricing & Capacity */}
                  <PricingSection register={register} errors={errors} />

                  {/* Trip Media */}
                  <MediaSection
                    register={register}
                    setValue={setValue}
                    watch={watch}
                  />

                  {/* Trip Description */}
                  <DescriptionSection register={register} errors={errors} />

                  {/* Day-by-Day Itinerary */}
                  <ItineraryBuilder
                    register={register}
                    setValue={setValue}
                    watch={watch}
                  />

                  {/* Inclusions & Exclusions */}
                  <InclusionsSection
                    register={register}
                    setValue={setValue}
                    watch={watch}
                  />

                  {/* Policies & Requirements */}
                  <PoliciesSection register={register} errors={errors} />

                  {/* Action Buttons - Mobile */}
                  <div className="lg:hidden sticky bottom-20 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 space-y-3 -mx-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Publish Trip
                        </>
                      )}
                    </button>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={onSaveDraft}
                        disabled={isSaving}
                        className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-900 dark:text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        Save Draft
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-5 h-5" />
                        {showPreview ? "Hide" : "Preview"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preview Panel - Right Column (Desktop) */}
                <div className="hidden lg:block lg:col-span-1">
                  <div className="sticky top-6">
                    <PreviewPanel formData={formData} />

                    {/* Action Buttons - Desktop */}
                    <div className="mt-6 space-y-3">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Publish Trip
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={onSaveDraft}
                        disabled={isSaving}
                        className="w-full py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-900 dark:text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        Save Draft
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Modal - Mobile */}
              {showPreview && (
                <div className="lg:hidden fixed inset-0 bg-black/50 z-50 overflow-y-auto">
                  <div className="min-h-screen p-4 pt-20">
                    <div className="bg-white dark:bg-slate-900 rounded-lg max-w-2xl mx-auto">
                      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          Preview
                        </h3>
                        <button
                          onClick={() => setShowPreview(false)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                      </div>
                      <div className="p-4">
                        <PreviewPanel formData={formData} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </main>

        {/* Bottom Navigation - Mobile */}
        <div className="lg:hidden">
          <BottomNav activePage="create" onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}