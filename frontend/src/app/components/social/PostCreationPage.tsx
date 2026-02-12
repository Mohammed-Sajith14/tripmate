import { useState } from "react";
import { LeftNav } from "../home/LeftNav";
import { TopBar } from "../home/TopBar";
import { BottomNav } from "../home/BottomNav";
import {
  Image as ImageIcon,
  MapPin,
  X,
  Upload,
  ChevronLeft,
  Send,
} from "lucide-react";
import { toast } from "sonner";

interface PostCreationPageProps {
  isDark: boolean;
  toggleTheme: () => void;
  onNavigate: (page: string) => void;
}

export function PostCreationPage({
  isDark,
  toggleTheme,
  onNavigate,
}: PostCreationPageProps) {
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          if (newImages.length === files.length) {
            setUploadedImages([...uploadedImages, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!caption.trim() && uploadedImages.length === 0) {
      toast.error("Please add a caption or at least one photo");
      return;
    }

    setIsPosting(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: caption,
          location: location || undefined,
          images: uploadedImages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Post shared successfully!");
        
        // Reset form
        setCaption("");
        setLocation("");
        setUploadedImages([]);
        
        // Dispatch event to refresh feed
        window.dispatchEvent(new Event('postCreated'));
        
        // Navigate back to home
        onNavigate("home");
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error("Failed to share post. Please try again.");
    } finally {
      setIsPosting(false);
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
          <LeftNav activePage="create" onNavigate={onNavigate} />
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 pb-20 lg:pb-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {/* Page Header */}
            <div className="mb-6">
              <button
                onClick={() => onNavigate("home")}
                className="flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 mb-4 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Home
              </button>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Create Post
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Share your travel moments with your followers
              </p>
            </div>

            {/* Post Creation Form */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {/* Caption Input */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="What's on your mind? Share your travel story..."
                  className="w-full px-0 py-2 bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-none text-lg"
                  rows={4}
                />
              </div>

              {/* Location Input */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-teal-500" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Add location (e.g., Bali, Indonesia)"
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="p-6">
                {/* Uploaded Images Grid */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {uploadedImages.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden group"
                      >
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:border-teal-500 dark:hover:border-teal-500 transition-colors bg-slate-50 dark:bg-slate-950/50">
                  <div className="flex flex-col items-center justify-center py-6">
                    <Upload className="w-10 h-10 text-slate-400 dark:text-slate-600 mb-3" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Click to upload photos
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800">
                <div className="flex gap-3">
                  <button
                    onClick={() => onNavigate("home")}
                    className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePost}
                    disabled={isPosting || (!caption.trim() && uploadedImages.length === 0)}
                    className="flex-1 px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isPosting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Share Post
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div className="mt-6 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-xl border border-teal-100 dark:border-teal-900 p-4">
              <h3 className="font-semibold text-teal-900 dark:text-teal-300 mb-2 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Tips for great posts
              </h3>
              <ul className="text-sm text-teal-700 dark:text-teal-400 space-y-1">
                <li>• Add multiple photos to showcase different moments</li>
                <li>• Tag your location to help others discover new places</li>
                <li>• Share authentic experiences and travel tips</li>
                <li>• Use descriptive captions to tell your story</li>
              </ul>
            </div>
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
