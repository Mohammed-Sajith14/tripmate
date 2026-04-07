import { useState, useEffect, useRef } from "react";
import { LeftNav } from "../home/LeftNav";
import { TopBar } from "../home/TopBar";
import { BottomNav } from "../home/BottomNav";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { ContextPanel } from "./ContextPanel";
import { useSocket } from "../../../utils/useSocket";
import { API_BASE_URL } from "../../../utils/auth";

interface MessagesPageProps {
  isDark: boolean;
  toggleTheme: () => void;
  onNavigate: (page: string) => void;
}

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    userId: string;
    fullName: string;
    profilePicture?: string;
    role: "traveler" | "organizer";
    bio?: string;
    location?: string;
    organizationName?: string;
    organizationDescription?: string;
  }>;
  otherParticipant?: {
    _id: string;
    userId: string;
    fullName: string;
    profilePicture?: string;
    role: "traveler" | "organizer";
    bio?: string;
    location?: string;
    organizationName?: string;
    organizationDescription?: string;
  };
  type: string;
  trip?: {
    _id: string;
    title: string;
    destination: string;
    coverImage?: string;
  } | null;
  lastMessage?: {
    content: string;
    timestamp: string;
  };
  unreadCount?: number;
  updatedAt?: string;
}

export function MessagesPage({
  isDark,
  toggleTheme,
  onNavigate,
}: MessagesPageProps) {
  const { socket, isConnected } = useSocket();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const cacheKey = `messages:conversations:${currentUser?._id || "anonymous"}`;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showMobileContext, setShowMobileContext] = useState(false);
  const [loading, setLoading] = useState(true);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());
  const isFetchingConversationsRef = useRef(false);

  const sortConversationsByRecency = (list: Conversation[]) => {
    return [...list].sort((a, b) => {
      const aTime = new Date(a.lastMessage?.timestamp || a.updatedAt || 0).getTime();
      const bTime = new Date(b.lastMessage?.timestamp || b.updatedAt || 0).getTime();
      return bTime - aTime;
    });
  };

  const buildNormalizedConversation = (
    rawConversation: any,
    fallback: { userId?: string; userName?: string; role?: "traveler" | "organizer" } = {}
  ): Conversation => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const participants = rawConversation?.participants || [];
    const participantFromList = participants.find((participant: any) => participant?._id !== currentUser?._id);
    const otherParticipant =
      rawConversation?.otherParticipant ||
      participantFromList || {
        _id: "",
        userId: fallback.userId || "unknown",
        fullName: fallback.userName || fallback.userId || "Unknown",
        profilePicture: "",
        role: fallback.role || "traveler",
      };

    const normalizedOtherParticipant = {
      ...otherParticipant,
      fullName: otherParticipant?.fullName || otherParticipant?.userId || fallback.userName || "Unknown",
      userId: otherParticipant?.userId || fallback.userId || "unknown",
      profilePicture: otherParticipant?.profilePicture || "",
    };

    return {
      ...rawConversation,
      participants,
      otherParticipant: normalizedOtherParticipant,
      type: rawConversation?.type || "direct",
      trip: rawConversation?.trip || null,
      lastMessage: rawConversation?.lastMessage,
      unreadCount: rawConversation?.unreadCount || 0,
      updatedAt: rawConversation?.updatedAt,
    };
  };

  const upsertAndSortConversation = (incomingConversation: Conversation) => {
    setConversations((prev) => {
      const existingIndex = prev.findIndex((conversation) => conversation._id === incomingConversation._id);

      if (existingIndex === -1) {
        return sortConversationsByRecency([incomingConversation, ...prev]);
      }

      const updated = [...prev];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...incomingConversation,
      };
      return sortConversationsByRecency(updated);
    });
  };

  const fetchConversationSummaries = async () => {
    if (isFetchingConversationsRef.current) {
      return;
    }

    try {
      isFetchingConversationsRef.current = true;
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const conversationList = data?.data?.conversations || [];
      const normalized = sortConversationsByRecency(
        conversationList.map((conversation: any) => buildNormalizedConversation(conversation))
      );

      setConversations((prev) => {
        if (prev.length === 0) {
          return normalized;
        }

        const prevMap = new Map(prev.map((conversation) => [conversation._id, conversation]));
        const merged = normalized.map((conversation) => {
          const existing = prevMap.get(conversation._id);
          if (!existing) {
            return conversation;
          }

          return {
            ...conversation,
            unreadCount:
              conversation._id === activeConversationId
                ? 0
                : conversation.unreadCount ?? existing.unreadCount ?? 0,
          };
        });

        return sortConversationsByRecency(merged);
      });
    } catch (error) {
      console.error("Error refreshing conversation summaries:", error);
    } finally {
      isFetchingConversationsRef.current = false;
    }
  };

  const fetchAndInsertConversation = async (
    conversationId: string,
    message?: any,
    isOwnMessage?: boolean
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/messages/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const conversationData = data?.data?.conversation;
      if (!conversationData) {
        return;
      }

      const messages = conversationData.messages || [];
      const latestMessage = messages[messages.length - 1];

      const normalizedConversation = buildNormalizedConversation({
        ...conversationData,
        lastMessage: message
          ? {
              content: message.content,
              timestamp: message.timestamp,
            }
          : latestMessage
          ? {
              content: latestMessage.content,
              timestamp: latestMessage.createdAt || latestMessage.timestamp,
            }
          : conversationData.lastMessage,
        unreadCount:
          activeConversationId === conversationData._id || isOwnMessage
            ? 0
            : conversationData.unreadCount || 1,
      });

      upsertAndSortConversation(normalizedConversation);
      return normalizedConversation;
    } catch (error) {
      console.error("Error fetching missing conversation:", error);
      return null;
    }
  };

  const ensureTripInquiryConversation = async (tripId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/messages/inquiry/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tripId }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success || !data?.data?.conversation) {
        return null;
      }

      const normalizedConversation = buildNormalizedConversation(data.data.conversation);
      upsertAndSortConversation(normalizedConversation);
      return normalizedConversation;
    } catch (error) {
      console.error("Error ensuring trip inquiry conversation:", error);
      return null;
    }
  };

  const ensureOrganizerConversation = async (organizerId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/messages/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otherUserId: organizerId }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success || !data?.data?.conversation) {
        return null;
      }

      const normalizedConversation = buildNormalizedConversation(data.data.conversation);
      upsertAndSortConversation(normalizedConversation);
      return normalizedConversation;
    } catch (error) {
      console.error("Error ensuring organizer conversation:", error);
      return null;
    }
  };

  // Fetch conversations on mount
  useEffect(() => {
    const pendingConversationId = localStorage.getItem("pendingConversationId");
    const pendingConversationOrganizerRaw =
      localStorage.getItem("pendingConversationOrganizerRaw") || "";
    const pendingConversationOrganizerId = (
      localStorage.getItem("pendingConversationOrganizerId") || ""
    ).toLowerCase();
    const pendingConversationTripId = localStorage.getItem("pendingConversationTripId");
    const hasPendingContext = Boolean(
      pendingConversationId || pendingConversationOrganizerId || pendingConversationTripId
    );

    // Hydrate from local cache immediately
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hydrated = sortConversationsByRecency(
            parsed.map((conversation: any) => buildNormalizedConversation(conversation))
          );
          setConversations(hydrated);
          if (!hasPendingContext && !activeConversationId && hydrated[0]?._id) {
            setActiveConversationId(hydrated[0]._id);
          }
        }
      }
    } catch (error) {
      console.error("Error hydrating cached conversations:", error);
    }

    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/messages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (data.data && data.data.conversations) {
          const initialConversations = sortConversationsByRecency(
            data.data.conversations.map((conversation: any) =>
              buildNormalizedConversation(conversation)
            )
          );

          setConversations(initialConversations);

          const findPendingConversation = (list: Conversation[]) => {
            if (pendingConversationTripId) {
              const byTrip = list.find(
                (conversation) => conversation.trip?._id === pendingConversationTripId
              );
              if (byTrip) {
                return byTrip;
              }
            }

            if (pendingConversationOrganizerId) {
              return list.find((conversation) => {
                const otherUserId = conversation.otherParticipant?.userId?.toLowerCase();
                const otherParticipantId = String(conversation.otherParticipant?._id || "");
                if (
                  otherUserId === pendingConversationOrganizerId ||
                  otherParticipantId === pendingConversationOrganizerId ||
                  otherParticipantId === pendingConversationOrganizerRaw
                ) {
                  return true;
                }

                return conversation.participants.some(
                  (participant) =>
                    participant.userId?.toLowerCase() === pendingConversationOrganizerId ||
                    String(participant._id || "") === pendingConversationOrganizerId ||
                    String(participant._id || "") === pendingConversationOrganizerRaw
                );
              });
            }

            return undefined;
          };

          let targetConversationId: string | null = null;

          if (pendingConversationId) {
            const pendingExists = initialConversations.some(
              (conversation) => conversation._id === pendingConversationId
            );

            if (pendingExists) {
              targetConversationId = pendingConversationId;
            } else {
              const insertedConversation = await fetchAndInsertConversation(pendingConversationId);
              if (insertedConversation?._id) {
                targetConversationId = insertedConversation._id;
              }
            }
          }

          if (!targetConversationId) {
            const pendingMatch = findPendingConversation(initialConversations);
            if (pendingMatch?._id) {
              targetConversationId = pendingMatch._id;
            }
          }

          if (!targetConversationId && pendingConversationTripId) {
            const ensuredConversation = await ensureTripInquiryConversation(pendingConversationTripId);
            if (ensuredConversation?._id) {
              targetConversationId = ensuredConversation._id;
            }
          }

          if (!targetConversationId && pendingConversationOrganizerId) {
            const ensuredConversation = await ensureOrganizerConversation(
              pendingConversationOrganizerRaw || pendingConversationOrganizerId
            );
            if (ensuredConversation?._id) {
              targetConversationId = ensuredConversation._id;
            }
          }

          if (targetConversationId) {
            setActiveConversationId(targetConversationId);
            setShowMobileChat(true);
          } else if (!hasPendingContext && initialConversations.length > 0) {
            setActiveConversationId(initialConversations[0]._id);
          }

          if (targetConversationId || !hasPendingContext) {
            localStorage.removeItem("pendingConversationId");
            localStorage.removeItem("pendingConversationOrganizerId");
            localStorage.removeItem("pendingConversationOrganizerRaw");
            localStorage.removeItem("pendingConversationTripId");
          }
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Persist conversations cache for quick restore when revisiting messages page
  useEffect(() => {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(conversations));
    } catch (error) {
      console.error("Error caching conversations:", error);
    }
  }, [cacheKey, conversations]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (isConnected && currentUser?._id) {
      socket.emit("user_connected", currentUser._id);
    }

    // When a new message arrives
    socket.on("message_received", (message: any) => {
      const incomingMessageId = message?.id || message?._id;
      if (incomingMessageId && processedMessageIdsRef.current.has(incomingMessageId)) {
        return;
      }

      if (incomingMessageId) {
        processedMessageIdsRef.current.add(incomingMessageId);
      }

      const isOwnMessage =
        message.sender?._id === currentUser?._id ||
        message.sender?.userId === currentUser?.userId;

      let conversationFound = false;

      setConversations((prev) =>
        sortConversationsByRecency(prev.map((conv) => {
          if (conv._id === message.conversationId) {
            conversationFound = true;
            const shouldIncrementUnread = !isOwnMessage && activeConversationId !== conv._id;

            return {
              ...conv,
              lastMessage: {
                content: message.content,
                timestamp: message.timestamp,
              },
              unreadCount: shouldIncrementUnread ? (conv.unreadCount || 0) + 1 : conv.unreadCount || 0,
            };
          }
          return conv;
        }))
      );

      if (!conversationFound && message?.conversationId) {
        fetchAndInsertConversation(message.conversationId, message, isOwnMessage);
        fetchConversationSummaries();
      }
    });

    // When a message is marked as read
    socket.on("message_read", (data: any) => {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv._id === (data?.conversationId || activeConversationId)) {
            return {
              ...conv,
              unreadCount: 0,
            };
          }
          return conv;
        })
      );
    });

    // Cleanup
    return () => {
      socket.off("message_received");
      socket.off("message_read");
    };
  }, [socket, isConnected, activeConversationId]);

  const activeConversation = conversations.find(
    (conv) => conv._id === activeConversationId
  );

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setShowMobileChat(true);

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation._id === id ? { ...conversation, unreadCount: 0 } : conversation
      )
    );

    // Join socket room for this conversation
    if (socket && isConnected) {
      socket.emit("join_conversation", id);
    }
  };

  const handleStartConversation = async (userId: string, userName: string) => {
    try {
      const token = localStorage.getItem("token");
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const response = await fetch(`${API_BASE_URL}/messages/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otherUserId: userId }),
      });

      if (response.ok) {
        const data = await response.json();
        const newConversation = data.data.conversation;
        const conversationId = newConversation._id;

        const normalizedConversation = buildNormalizedConversation(newConversation, {
          userId,
          userName,
        });

        upsertAndSortConversation(normalizedConversation);

        setActiveConversationId(conversationId);
        setShowMobileChat(true);

        // Join socket room for this conversation
        if (socket && isConnected) {
          socket.emit("join_conversation", conversationId);
        }
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  const handleShowInfo = () => {
    setShowMobileContext(true);
  };

  const handleCloseContext = () => {
    setShowMobileContext(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Left Navigation */}
      <LeftNav activePage="messages" onNavigate={onNavigate} />

      {/* Top Bar */}
      <TopBar isDark={isDark} toggleTheme={toggleTheme} />

      {/* Main Content - Three Panel Layout */}
      <div className="lg:ml-64 pt-16 pb-16 lg:pb-0 h-screen">
        <div className="h-full flex">
          {/* Desktop: Three-panel layout */}
          <div className="hidden lg:grid lg:grid-cols-[320px_1fr_320px] w-full h-full">
            {/* Left Panel - Conversations List */}
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              onStartConversation={handleStartConversation}
            />

            {/* Center Panel - Chat Window */}
            <ChatWindow
              socket={socket}
              isConnected={isConnected}
              conversation={
                activeConversation
                  ? {
                      _id: activeConversation._id,
                      name: activeConversation.otherParticipant?.fullName || "Unknown",
                      userId: activeConversation.otherParticipant?.userId || "unknown",
                      role: activeConversation.otherParticipant?.role || "traveler",
                      tripContext: activeConversation.trip
                        ? {
                            tripName: activeConversation.trip.title,
                            destination: activeConversation.trip.destination,
                          }
                        : null,
                      otherParticipant: activeConversation.otherParticipant,
                    }
                  : null
              }
              onBack={handleBackToList}
              onShowInfo={handleShowInfo}
              onViewTrip={() => onNavigate("trips")}
            />

            {/* Right Panel - Context */}
            {activeConversation && (
              <ContextPanel
                type={activeConversation.otherParticipant?.role || "traveler"}
                data={{
                  userId: activeConversation.otherParticipant?.userId || "unknown",
                  name: activeConversation.otherParticipant?.fullName || "Unknown",
                  role:
                    activeConversation.otherParticipant?.role === "organizer"
                      ? "Organizer"
                      : "Traveler",
                  bio: activeConversation.otherParticipant?.bio,
                  location: activeConversation.otherParticipant?.location,
                  organizationName: activeConversation.otherParticipant?.organizationName,
                  organizationDescription:
                    activeConversation.otherParticipant?.organizationDescription,
                }}
                tripContext={
                  activeConversation.trip
                    ? {
                        tripName: activeConversation.trip.title,
                        destination: activeConversation.trip.destination,
                        image: activeConversation.trip.coverImage || "",
                      }
                    : null
                }
                onViewProfile={() => onNavigate("profile")}
                onViewTrip={() => onNavigate("trips")}
              />
            )}
          </div>

          {/* Mobile: Two-panel flow */}
          <div className="lg:hidden w-full h-full">
            {!showMobileChat ? (
              /* Show Conversations List */
              <ConversationList
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
                onStartConversation={handleStartConversation}
              />
            ) : !showMobileContext ? (
              /* Show Chat Window */
              <ChatWindow
                socket={socket}
                isConnected={isConnected}
                conversation={
                  activeConversation
                    ? {
                        _id: activeConversation._id,
                        name: activeConversation.otherParticipant?.fullName || "Unknown",
                        userId: activeConversation.otherParticipant?.userId || "unknown",
                        role: activeConversation.otherParticipant?.role || "traveler",
                        tripContext: activeConversation.trip
                          ? {
                              tripName: activeConversation.trip.title,
                              destination: activeConversation.trip.destination,
                            }
                          : null,
                        otherParticipant: activeConversation.otherParticipant,
                      }
                    : null
                }
                onBack={handleBackToList}
                onShowInfo={handleShowInfo}
                onViewTrip={() => onNavigate("trips")}
              />
            ) : (
              /* Show Context Panel (Mobile Overlay) */
              <div className="relative h-full">
                <div
                  className="absolute inset-0 bg-black/50 z-10"
                  onClick={handleCloseContext}
                />
                <div className="absolute inset-y-0 right-0 w-full max-w-sm z-20 shadow-xl">
                  {activeConversation && (
                    <ContextPanel
                      type={activeConversation.otherParticipant?.role || "traveler"}
                      data={{
                        userId: activeConversation.otherParticipant?.userId || "unknown",
                        name: activeConversation.otherParticipant?.fullName || "Unknown",
                        role:
                          activeConversation.otherParticipant?.role === "organizer"
                            ? "Organizer"
                            : "Traveler",
                        bio: activeConversation.otherParticipant?.bio,
                        location: activeConversation.otherParticipant?.location,
                        organizationName: activeConversation.otherParticipant?.organizationName,
                        organizationDescription:
                          activeConversation.otherParticipant?.organizationDescription,
                      }}
                      tripContext={
                        activeConversation.trip
                          ? {
                              tripName: activeConversation.trip.title,
                              destination: activeConversation.trip.destination,
                              image: activeConversation.trip.coverImage || "",
                            }
                          : null
                      }
                      onViewProfile={() => {
                        handleCloseContext();
                        onNavigate("profile");
                      }}
                      onViewTrip={() => {
                        handleCloseContext();
                        onNavigate("trips");
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav activePage="messages" onNavigate={onNavigate} />
    </div>
  );
}
