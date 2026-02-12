import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isSent: boolean;
  isRead?: boolean;
}

export function MessageBubble({
  content,
  timestamp,
  isSent,
  isRead,
}: MessageBubbleProps) {
  return (
    <div className={`flex ${isSent ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[70%] ${isSent ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isSent
              ? "bg-teal-500 text-white rounded-br-md"
              : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-md"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </p>
        </div>
        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {timestamp}
          </span>
          {isSent && (
            <span className="text-slate-400 dark:text-slate-500">
              {isRead ? (
                <CheckCheck className="size-3" />
              ) : (
                <Check className="size-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
