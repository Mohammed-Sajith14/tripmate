import { MapPin } from "lucide-react";

interface SocialHighlightCardProps {
  userId: string;
  destination: string;
  image: string;
  caption: string;
  userAvatar?: string;
}

export function SocialHighlightCard({
  userId,
  destination,
  image,
  caption,
  userAvatar,
}: SocialHighlightCardProps) {
  return (
    <div className="flex-shrink-0 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      {/* Image */}
      <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={image}
          alt={destination}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
            {userAvatar ? (
              <img src={userAvatar} alt={userId} className="w-full h-full object-cover" />
            ) : (
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {userId.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900 dark:text-white truncate">
              {userId}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
              <MapPin className="size-3 flex-shrink-0" />
              {destination}
            </p>
          </div>
        </div>

        {/* Caption */}
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
          {caption}
        </p>
      </div>
    </div>
  );
}
