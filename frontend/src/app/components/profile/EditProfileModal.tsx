import { X, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface EditProfileModalProps {
  userData: {
    userId: string;
    fullName: string;
    bio: string;
    organizationName?: string;
    organizationLocation?: string;
    organizationDescription?: string;
  };
  userType: "traveler" | "organizer";
  onClose: () => void;
}

export function EditProfileModal({
  userData,
  userType,
  onClose,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    fullName: userData.fullName,
    bio: userData.bio,
    organizationName: userData.organizationName || "",
    organizationLocation: userData.organizationLocation || "",
    organizationDescription: userData.organizationDescription || "",
  });
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
        toast.success("Profile picture uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to update your profile');
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          bio: formData.bio,
          ...(profilePicture && { profilePicture }),
          ...(userType === 'organizer' && {
            organizationName: formData.organizationName,
            organizationLocation: formData.organizationLocation,
            organizationDescription: formData.organizationDescription
          })
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Update localStorage with new user data
        localStorage.setItem('user', JSON.stringify(data.data.user));
        toast.success('Profile updated successfully!');
        // Dispatch event to notify ProfilePage to refresh
        window.dispatchEvent(new Event('userProfileUpdated'));
        onClose();
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Network error. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="size-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                <div
                  className="size-20 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={
                    profilePicture
                      ? {
                          backgroundImage: `url(${profilePicture})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : {}
                  }
                >
                  {!profilePicture && (
                    <div className="size-full rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {userData.userId.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg transition-colors cursor-pointer">
                  <Upload className="size-4" />
                  <span>Upload new photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Recommended: Square image, at least 400x400px
              </p>
            </div>

            {/* User ID (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                User ID
              </label>
              <input
                type="text"
                value={userData.userId}
                disabled
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Your unique user ID cannot be changed
              </p>
            </div>

            {/* Full Name / Organization Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {userType === "organizer" ? "Organization Name" : "Full Name"}
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder={userType === "organizer" ? "Enter organization name" : "Enter your full name"}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
              />
            </div>

            {/* Organizer-Specific Fields */}
            {userType === "organizer" && (
              <>
                {/* Organization Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.organizationLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organizationLocation: e.target.value,
                      })
                    }
                    placeholder="City, Country"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                  />
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Where your organization is based
                  </p>
                </div>

                {/* Organization Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Organization Description
                  </label>
                  <textarea
                    value={formData.organizationDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organizationDescription: e.target.value,
                      })
                    }
                    rows={4}
                    placeholder="Tell travelers about your organization, mission, and what makes you unique"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition-shadow"
                  />
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Professional description of your travel organization
                  </p>
                </div>
              </>
            )}

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {userType === "organizer" ? "About" : "Bio"}
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={4}
                placeholder={
                  userType === "organizer"
                    ? "Share your organization's story and what makes your trips special"
                    : "Tell others about your travel style and interests"
                }
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition-shadow"
              />
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {userType === "organizer"
                  ? "This appears in your profile header"
                  : "Share what makes you unique as a traveler"}
              </p>
            </div>
          </div>

          {/* Actions - Sticky Footer */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}