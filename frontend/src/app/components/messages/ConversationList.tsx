import { Search, MessageSquarePlus } from "lucide-react";
import { useState, useEffect } from "react";
import { ConversationItem } from "./ConversationItem";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

interface Conversation {
  id?: string;
  _id?: string;
  otherParticipant?: {
    _id?: string;
    userId?: string;
    fullName?: string;
    profilePicture?: string;
    role?: "traveler" | "organizer";
  };
  lastMessage?: {
    content: string;
    timestamp: string;
  };
  unreadCount?: number;
}

interface FriendUser {
  _id: string;
  userId: string;
  fullName: string;
  profilePicture?: string;
  role?: "traveler" | "organizer";
}

interface MappedConversation {
  id: string;
  name: string;
  userId: string;
  profilePicture?: string;
  role: "traveler" | "organizer";
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onStartConversation?: (userId: string, userName: string) => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onStartConversation,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "organizers" | "travelers">("all");
  const [searchUsers, setSearchUsers] = useState<FriendUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const resolveDisplayName = (participant?: {
    fullName?: string;
    userId?: string;
  }) => {
    const fullName = (participant?.fullName || "").trim();
    const userId = (participant?.userId || "").trim();
    const normalizedName = fullName.toLowerCase();

    if (fullName && normalizedName !== "traveler" && normalizedName !== "organizer") {
      return fullName;
    }

    if (userId) {
      return `@${userId}`;
    }

    return "Unknown User";
  };

  // Search users by query (all users, excluding current user)
  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) {
      setSearchUsers([]);
      setLoadingUsers(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingUsers(true);
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_BASE_URL}/users/search?query=${encodeURIComponent(query)}&limit=20`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          setSearchUsers([]);
          return;
        }

        const data = await response.json();
        const users: FriendUser[] = data?.data?.users || [];
        setSearchUsers(users);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Map conversations to have consistent properties
  const mappedConversations: MappedConversation[] = conversations.map((conv) => ({
    id: conv._id || conv.id || "",
    name: resolveDisplayName(conv.otherParticipant),
    userId: conv.otherParticipant?.userId || "unknown",
    profilePicture: conv.otherParticipant?.profilePicture,
    role: conv.otherParticipant?.role || "traveler",
    lastMessage: conv.lastMessage?.content || "No messages yet",
    timestamp: conv.lastMessage?.timestamp || "",
    unreadCount: conv.unreadCount || 0,
  }));

  // Filter conversations based on search and filter
  const filteredConversations = mappedConversations.filter((conv) => {
    const matchesSearch = 
      !searchQuery.trim() || 
      (conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (conv.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "organizers" && conv.role === "organizer") ||
      (activeFilter === "travelers" && conv.role === "traveler");

    return matchesSearch && matchesFilter;
  });

  const existingConversationUserIds = new Set(
    mappedConversations.map((conversation) => conversation.userId)
  );

  const filteredUserResults = searchUsers.filter((friend) => {
    if (existingConversationUserIds.has(friend.userId)) {
      return false;
    }

    const matchesSearch =
      !searchQuery.trim() ||
      friend.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.userId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "organizers" && friend.role === "organizer") ||
      (activeFilter === "travelers" && friend.role === "traveler");

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
        {/* Show conversations first */}
        {filteredConversations.length > 0 &&
          filteredConversations.map((conversation) => {
            const convId = conversation._id || conversation.id;
            return (
              <ConversationItem
                key={convId}
                id={convId}
                name={conversation.name || ""}
                userId={conversation.userId || ""}
                profilePicture={conversation.profilePicture}
                lastMessage={conversation.lastMessage || ""}
                timestamp={conversation.timestamp || ""}
                unreadCount={conversation.unreadCount}
                isActive={convId === activeConversationId}
                onClick={() => onSelectConversation(convId || "")}
              />
            );
          })}

        {/* Show search results for friends (followers + following) */}
        {searchQuery.trim() && filteredUserResults.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-800 p-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2 py-2">
              Start a conversation:
            </p>
            {filteredUserResults.map((user) => (
              <button
                key={user._id}
                onClick={() => {
                  if (onStartConversation) {
                    onStartConversation(user.userId, user.fullName);
                  }
                }}
                className="w-full px-3 py-2 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      @{user.userId}
                    </p>
                  </div>
                </div>
                <MessageSquarePlus className="size-4 text-teal-500 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}

        {searchQuery.trim() && loadingUsers && (
          <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
            Searching users...
          </div>
        )}
        
        {/* Empty state */}
        {filteredConversations.length === 0 && filteredUserResults.length === 0 && !loadingUsers && (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <Search className="size-8 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
              {searchQuery ? "No conversations or users found" : "No conversations yet"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {searchQuery
                ? "Search for someone else"
                : "Search travelers and organizers to start messaging"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
