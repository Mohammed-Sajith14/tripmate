import { Search } from "lucide-react";
import { useState } from "react";
import { ConversationItem } from "./ConversationItem";

interface Conversation {
  id: string;
  name: string;
  userId: string;
  role: "traveler" | "organizer";
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "organizers" | "travelers">("all");

  // Filter conversations based on search and filter
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = 
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "organizers" && conv.role === "organizer") ||
      (activeFilter === "travelers" && conv.role === "traveler");

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Messages
        </h2>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeFilter === "all"
                ? "bg-teal-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter("organizers")}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeFilter === "organizers"
                ? "bg-teal-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Organizers
          </button>
          <button
            onClick={() => setActiveFilter("travelers")}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeFilter === "travelers"
                ? "bg-teal-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Travelers
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              {...conversation}
              isActive={conversation.id === activeConversationId}
              onClick={() => onSelectConversation(conversation.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <Search className="size-8 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No conversations found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
