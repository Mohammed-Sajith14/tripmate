import { Camera, MapPin, Shield } from "lucide-react";

interface PermissionsScreenProps {
  onContinue: () => void;
}

export function PermissionsScreen({ onContinue }: PermissionsScreenProps) {
  const permissions = [
    {
      icon: MapPin,
      title: "Location Access",
      description:
        "Used for nearby trip discovery and personalized recommendations based on your location",
    },
    {
      icon: Camera,
      title: "Gallery Access",
      description:
        "Used for uploading trip photos, reviews, and sharing your travel memories with the community",
    },
  ];

  return (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8 text-center">
        <div className="inline-flex p-4 rounded-full bg-teal-50 dark:bg-teal-950 mb-4">
          <Shield className="size-8 text-teal-500" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome aboard!
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          To give you the best experience, we need a few permissions
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {permissions.map((permission, index) => {
          const Icon = permission.icon;
          return (
            <div
              key={index}
              className="flex gap-4 p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900">
                  <Icon className="size-6 text-teal-500" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {permission.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {permission.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Privacy Message */}
      <div className="p-4 bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-900 rounded-xl mb-6">
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
          <span className="font-medium">Your privacy matters:</span>
        </p>
        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <li>• All automatically collected data remains private by default</li>
          <li>• You are always in control of what you share</li>
          <li>• Update your preferences anytime in settings</li>
        </ul>
      </div>

      {/* Continue Button */}
      <button
        onClick={onContinue}
        className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        Continue to Trip Mate
      </button>
    </div>
  );
}
