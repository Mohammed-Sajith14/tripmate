import { useState } from "react";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { TripFormData } from "./CreateTripPage";
import { Upload, X, ImageIcon } from "lucide-react";

interface MediaSectionProps {
  register: UseFormRegister<TripFormData>;
  setValue: UseFormSetValue<TripFormData>;
  watch: UseFormWatch<TripFormData>;
}

export function MediaSection({ register, setValue, watch }: MediaSectionProps) {
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setValue("coverImage", file);
    }
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const previews: string[] = [];
      const readers = files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then((results) => {
        setGalleryPreviews([...galleryPreviews, ...results]);
      });

      const currentGallery = watch("galleryImages") || [];
      setValue("galleryImages", [...currentGallery, ...files]);
    }
  };

  const removeCoverImage = () => {
    setCoverPreview("");
    setValue("coverImage", undefined);
  };

  const removeGalleryImage = (index: number) => {
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);
    setGalleryPreviews(newPreviews);

    const currentGallery = watch("galleryImages") || [];
    const newGallery = currentGallery.filter((_, i) => i !== index);
    setValue("galleryImages", newGallery);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
        Trip Media
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Add images to showcase your trip
      </p>

      <div className="space-y-6">
        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Cover Image <span className="text-slate-400">(Recommended)</span>
          </label>

          {!coverPreview ? (
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center hover:border-teal-500 dark:hover:border-teal-500 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Click to upload cover image
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Recommended: 1200x600px, Max 5MB
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative rounded-lg overflow-hidden group">
              <img
                src={coverPreview}
                alt="Cover preview"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={removeCoverImage}
                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Gallery Images */}
        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Gallery Images <span className="text-slate-400">(Optional)</span>
          </label>

          {/* Gallery Preview Grid */}
          {galleryPreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              {galleryPreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative rounded-lg overflow-hidden group aspect-square"
                >
                  <img
                    src={preview}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center hover:border-teal-500 dark:hover:border-teal-500 transition-colors">
              <ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Add gallery images
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Upload multiple images to showcase your trip
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryImagesChange}
              className="hidden"
            />
          </label>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            You can upload up to 10 images. Each image should be under 5MB.
          </p>
        </div>
      </div>
    </div>
  );
}
