import { useState } from "react";
import { LeftNav } from "../home/LeftNav";
import { TopBar } from "../home/TopBar";
import { BottomNav } from "../home/BottomNav";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { ContextPanel } from "./ContextPanel";

interface MessagesPageProps {
  isDark: boolean;
  toggleTheme: () => void;
  onNavigate: (page: string) => void;
}

// Mock data
const mockConversations = [
  {
    id: "1",
    name: "Nomad Adventures",
    userId: "nomad_adventures",
    role: "organizer" as const,
    lastMessage: "Looking forward to having you on the trip! Let me know if you have any questions.",
    timestamp: "2m ago",
    unreadCount: 2,
    messages: [
      {
        id: "m1",
        content: "Hi! I'm interested in the Santorini Sunset Experience. Could you tell me more about the accommodation?",
        timestamp: "10:24 AM",
        isSent: true,
        isRead: true,
      },
      {
        id: "m2",
        content: "Hello! Great to hear from you. We'll be staying at a beautiful boutique hotel in Oia with stunning caldera views. All rooms have private balconies.",
        timestamp: "10:26 AM",
        isSent: false,
      },
      {
        id: "m3",
        content: "That sounds amazing! Is breakfast included?",
        timestamp: "10:28 AM",
        isSent: true,
        isRead: true,
      },
      {
        id: "m4",
        content: "Yes, daily breakfast is included at the hotel. We also have two group dinners planned at local tavernas.",
        timestamp: "10:30 AM",
        isSent: false,
      },
      {
        id: "m5",
        content: "Perfect! I'd like to book this trip. What are the next steps?",
        timestamp: "10:32 AM",
        isSent: true,
        isRead: true,
      },
      {
        id: "m6",
        content: "Looking forward to having you on the trip! Let me know if you have any questions.",
        timestamp: "10:35 AM",
        isSent: false,
      },
    ],
    tripContext: {
      tripName: "Santorini Sunset Experience",
      destination: "Santorini, Greece",
      image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600",
    },
    contextData: {
      userId: "nomad_adventures",
      name: "Nomad Adventures",
      role: "Organizer",
      location: "San Francisco, CA",
      organizationName: "Nomad Adventures LLC",
      organizationDescription:
        "Award-winning travel company focused on sustainable tourism and meaningful cultural exchanges. Our expert guides are locals who share their passion for their homeland.",
    },
  },
  {
    id: "2",
    name: "Sarah Chen",
    userId: "sarah_explorer",
    role: "traveler" as const,
    lastMessage: "Thanks for the recommendation! I'll check it out.",
    timestamp: "1h ago",
    messages: [
      {
        id: "m1",
        content: "Hey! I saw you're also going to Kyoto in December. Have you been there before?",
        timestamp: "Yesterday, 4:15 PM",
        isSent: false,
      },
      {
        id: "m2",
        content: "Hi Sarah! Yes, this will be my second time. The temples are incredible in winter!",
        timestamp: "Yesterday, 4:20 PM",
        isSent: true,
        isRead: true,
      },
      {
        id: "m3",
        content: "That's great! Any tips for a first-timer?",
        timestamp: "Yesterday, 4:22 PM",
        isSent: false,
      },
      {
        id: "m4",
        content: "Definitely visit Fushimi Inari early morning to avoid crowds. And don't miss the bamboo grove in Arashiyama!",
        timestamp: "Yesterday, 4:25 PM",
        isSent: true,
        isRead: true,
      },
      {
        id: "m5",
        content: "Thanks for the recommendation! I'll check it out.",
        timestamp: "Yesterday, 4:30 PM",
        isSent: false,
      },
    ],
    contextData: {
      userId: "sarah_explorer",
      name: "Sarah Chen",
      role: "Traveler",
      bio: "Digital nomad exploring Asia one city at a time. Love street food, hiking, and photography. Always up for a spontaneous adventure!",
    },
  },
  {
    id: "3",
    name: "Greek Explorers",
    userId: "greek_explorers",
    role: "organizer" as const,
    lastMessage: "The boat departs at 5 PM from the marina.",
    timestamp: "3h ago",
    messages: [
      {
        id: "m1",
        content: "Hi! Quick question about the sunset sail - what time does it start?",
        timestamp: "3:15 PM",
        isSent: true,
        isRead: true,
      },
      {
        id: "m2",
        content: "The boat departs at 5 PM from the marina.",
        timestamp: "3:20 PM",
        isSent: false,
      },
    ],
    tripContext: {
      tripName: "Santorini Sunset Sail",
      destination: "Santorini, Greece",
      image: "https://images.unsplash.com/photo-1613395877326-25b2ed8e3b7f?w=600",
    },
    contextData: {
      userId: "greek_explorers",
      name: "Greek Explorers",
      role: "Organizer",
      location: "Athens, Greece",
      organizationName: "Greek Explorers Tourism",
      organizationDescription:
        "Family-owned tour company specializing in authentic Greek island experiences. We've been sharing our love for Greece with travelers since 2015.",
    },
  },
  {
    id: "4",
    name: "Alex Martinez",
    userId: "alex_wanderer",
    role: "traveler" as const,
    lastMessage: "Sounds good! See you there.",
    timestamp: "Yesterday",
    messages: [
      {
        id: "m1",
        content: "Hey! Are you joining the Marrakech trip next month?",
        timestamp: "Yesterday, 2:10 PM",
        isSent: false,
      },
      {
        id: "m2",
        content: "Yes! I'm so excited. Have you been to Morocco before?",
        timestamp: "Yesterday, 2:15 PM",
        isSent: true,
        isRead: true,
      },
      {
        id: "m3",
        content: "First time! Want to grab coffee before the trip to chat about it?",
        timestamp: "Yesterday, 2:18 PM",
        isSent: false,
      },
      {
        id: "m4",
        content: "Sounds good! See you there.",
        timestamp: "Yesterday, 2:20 PM",
        isSent: true,
        isRead: true,
      },
    ],
    contextData: {
      userId: "alex_wanderer",
      name: "Alex Martinez",
      role: "Traveler",
      bio: "Adventure seeker and culture enthusiast. Been to 30+ countries and counting. Always looking for the next great experience!",
    },
  },
  {
    id: "5",
    name: "Andean Trails",
    userId: "andean_trails",
    role: "organizer" as const,
    lastMessage: "We provide all camping equipment.",
    timestamp: "2 days ago",
    messages: [
      {
        id: "m1",
        content: "Hi! I have a question about the Machu Picchu trek. Do I need to bring my own camping gear?",
        timestamp: "2 days ago, 11:30 AM",
        isSent: true,
        isRead: true,
      },
      {
        id: "m2",
        content: "We provide all camping equipment.",
        timestamp: "2 days ago, 11:45 AM",
        isSent: false,
      },
    ],
    tripContext: {
      tripName: "Peru Machu Picchu Trek",
      destination: "Cusco, Peru",
      image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=600",
    },
    contextData: {
      userId: "andean_trails",
      name: "Andean Trails",
      role: "Organizer",
      location: "Cusco, Peru",
      organizationName: "Andean Trails Adventure Co.",
      organizationDescription:
        "Local guides with deep knowledge of Incan history and Andean culture. We focus on sustainable trekking and supporting local communities.",
    },
  },
];

export function MessagesPage({
  isDark,
  toggleTheme,
  onNavigate,
}: MessagesPageProps) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    mockConversations[0].id
  );
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showMobileContext, setShowMobileContext] = useState(false);

  const activeConversation = mockConversations.find(
    (conv) => conv.id === activeConversationId
  );

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setShowMobileChat(true);
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
              conversations={mockConversations}
              activeConversationId={activeConversationId}
              onSelectConversation={setActiveConversationId}
            />

            {/* Center Panel - Chat Window */}
            <ChatWindow
              conversation={
                activeConversation
                  ? {
                      id: activeConversation.id,
                      name: activeConversation.name,
                      userId: activeConversation.userId,
                      role: activeConversation.role,
                      messages: activeConversation.messages,
                      tripContext: activeConversation.tripContext,
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
                type={activeConversation.role}
                data={activeConversation.contextData}
                tripContext={activeConversation.tripContext}
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
                conversations={mockConversations}
                activeConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
              />
            ) : !showMobileContext ? (
              /* Show Chat Window */
              <ChatWindow
                conversation={
                  activeConversation
                    ? {
                        id: activeConversation.id,
                        name: activeConversation.name,
                        userId: activeConversation.userId,
                        role: activeConversation.role,
                        messages: activeConversation.messages,
                        tripContext: activeConversation.tripContext,
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
                      type={activeConversation.role}
                      data={activeConversation.contextData}
                      tripContext={activeConversation.tripContext}
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
