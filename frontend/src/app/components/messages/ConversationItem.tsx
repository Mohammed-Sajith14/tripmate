interface ConversationItemProps {
  id: string;
  name: string;
  userId: string;
  profilePicture?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({
  name,
  userId,
  profilePicture,
  lastMessage,
  timestamp,
  unreadCount = 0,
  isActive,
  onClick,
}: ConversationItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b border-slate-200 dark:border-slate-800 transition-colors ${
        isActive
          ? "bg-teal-50 dark:bg-teal-950/30 border-l-4 border-l-teal-500"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
      }`}
    >
      <div className="flex gap-3">
        {/* Profile Picture */}
        {profilePicture ? (
          <img
            src={profilePicture}
            alt={name}
            className="size-12 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="size-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
            <span className="text-base font-semibold text-white">
              {(name || userId || "U").charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div className="min-w-0">
              <h3 className="font-medium text-slate-900 dark:text-white truncate">
                {name}
              </h3>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0 ml-2">
              {timestamp}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate flex-1">
              {lastMessage}
            </p>
            {unreadCount > 0 && (
              <span className="size-5 bg-teal-500 text-white text-xs font-medium rounded-full flex items-center justify-center flex-shrink-0">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
