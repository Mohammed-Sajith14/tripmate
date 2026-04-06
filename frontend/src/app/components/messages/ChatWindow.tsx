import { Send, Paperclip, Info, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import type { Socket } from "socket.io-client";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isSent: boolean;
  isRead?: boolean;
}

interface ChatWindowProps {
  socket: Socket | null;
  isConnected: boolean;
  conversation: {
    id?: string;
    _id?: string;
    name?: string;
    userId?: string;
    role?: "traveler" | "organizer";
    messages?: Message[];
    tripContext?: {
      tripName: string;
      destination: string;
    } | null;
    otherParticipant?: any;
  } | null;
  onBack: () => void;
  onShowInfo: () => void;
  onViewTrip?: () => void;
}

export function ChatWindow({
  socket,
  isConnected,
  conversation,
  onBack,
  onShowInfo,
  onViewTrip,
}: ChatWindowProps) {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  const formatTimestamp = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

  useEffect(() => {
    if (!socket || !isConnected || (!currentUser?._id && !currentUser?.userId)) {
      return;
    }

    socket.emit("user_connected", currentUser._id || currentUser.userId);
  }, [socket, isConnected, currentUser?._id, currentUser?.userId]);

  // Load conversation messages when active conversation changes
  useEffect(() => {
    const fetchConversationMessages = async () => {
      if (!conversation) {
        setMessages([]);
        return;
      }

      const conversationId = conversation._id || conversation.id;
      if (!conversationId) {
        setMessages([]);
        return;
      }

      if (socket && isConnected) {
        socket.emit("join_conversation", conversationId);
      }

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/messages/${conversationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const fetchedMessages = data?.data?.conversation?.messages || [];

        setMessages(
          fetchedMessages.map((message: any) => ({
            id: message._id,
            content: message.content,
            timestamp: formatTimestamp(message.createdAt || message.timestamp),
            isSent:
              message.sender?._id === currentUser._id ||
              message.sender?.userId === currentUser.userId,
            isRead: message.isRead,
          }))
        );
      } catch (error) {
        console.error("Error fetching conversation messages:", error);
      }
    };

    fetchConversationMessages();
  }, [conversation, socket, isConnected]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    socket.on("message_received", (message: any) => {
      const activeConversationId = conversation?._id || conversation?.id;
      if (!activeConversationId || message.conversationId !== activeConversationId) {
        return;
      }

      const incomingMessageId = message?.id || message?._id;
      if (incomingMessageId && processedMessageIdsRef.current.has(incomingMessageId)) {
        return;
      }

      if (incomingMessageId) {
        processedMessageIdsRef.current.add(incomingMessageId);
      }

      const incoming = {
        id: String(message.id || message._id || message.clientMessageId || Date.now()),
        content: message.content,
        timestamp: formatTimestamp(message.timestamp),
        isSent:
          message.sender?._id === currentUser._id ||
          message.sender?.userId === currentUser.userId,
        isRead: message.isRead,
      };

      setMessages((prev) => {
        const isOwnIncoming =
          message.sender?._id === currentUser._id ||
          message.sender?.userId === currentUser.userId;

        if (isOwnIncoming && message.clientMessageId) {
          const existingTempIndex = prev.findIndex(
            (entry) => entry.id === message.clientMessageId
          );

          if (existingTempIndex !== -1) {
            const updated = [...prev];
            updated[existingTempIndex] = {
              ...updated[existingTempIndex],
              ...incoming,
            };
            return updated;
          }
        }

        if (prev.some((entry) => entry.id === incoming.id)) {
          return prev;
        }

        return [...prev, incoming];
      });
    });

    return () => {
      socket.off("message_received");
    };
  }, [socket, conversation, currentUser._id, currentUser.userId]);

  const sendMessageViaRest = async (conversationId: string, content: string) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5000/api/messages/${conversationId}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    const data = await response.json();
    const sentMessage = data?.data?.message;

    setMessages((prev) => [
      ...prev,
      {
        id: sentMessage?._id || Date.now().toString(),
        content: sentMessage?.content || content,
        timestamp: formatTimestamp(sentMessage?.createdAt || new Date().toISOString()),
        isSent: true,
        isRead: sentMessage?.isRead || false,
      },
    ]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !conversation || isSending) return;

    const conversationId = conversation._id || conversation.id;
    if (!conversationId) return;

    setIsSending(true);

    try {
      const trimmedMessage = messageInput.trim();

      if (socket && isConnected) {
        const clientMessageId = `temp-${Date.now()}`;

        setMessages((prev) => [
          ...prev,
          {
            id: clientMessageId,
            content: trimmedMessage,
            timestamp: formatTimestamp(new Date().toISOString()),
            isSent: true,
            isRead: false,
          },
        ]);

        setMessageInput("");

        socket.emit("send_message", {
          conversationId,
          senderId: currentUser._id || currentUser.id,
          senderUserId: currentUser.userId,
          content: trimmedMessage,
          timestamp: new Date().toISOString(),
          clientMessageId,
        }, (ack: any) => {
          if (ack?.success) {
            return;
          }

          setMessages((prev) =>
            prev.filter((message) => message.id !== clientMessageId)
          );

          void sendMessageViaRest(conversationId, trimmedMessage).catch((error) => {
            console.error("Socket ack failed and REST fallback failed:", error);
            if (ack?.message) {
              alert(ack.message);
            } else {
              alert("Failed to send message. Please try again.");
            }
          });
        });

        return;
      }

      await sendMessageViaRest(conversationId, trimmedMessage);
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (!conversation) {
    return (
      <div className="h-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="size-20 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Send className="size-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Select a conversation
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Choose a conversation from the list to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Chat Header */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Back Button */}
            <button
              onClick={onBack}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="size-5 text-slate-600 dark:text-slate-400" />
            </button>

            {/* Profile Picture */}
            <div className="size-11 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
              <span className="text-base font-semibold text-white">
                {(conversation.userId || "U").charAt(0).toUpperCase()}
              </span>
            </div>

            {/* User Info */}
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {conversation.name || conversation.otherParticipant?.fullName || "Unknown"}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    (conversation.role || conversation.otherParticipant?.role) === "organizer"
                      ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {(conversation.role || conversation.otherParticipant?.role) === "organizer" ? "Organizer" : "Traveler"}
                </span>
              </div>
              {conversation.tripContext && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Regarding:{" "}
                  <button
                    onClick={onViewTrip}
                    className="text-teal-500 hover:text-teal-600 font-medium"
                  >
                    {conversation.tripContext.tripName}
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {conversation.tripContext && (
              <button
                onClick={onViewTrip}
                className="hidden md:flex px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
              >
                View Trip
              </button>
            )}
            <button
              onClick={onShowInfo}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Info className="size-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950">
        {/* Date Separator */}
        <div className="flex items-center justify-center mb-6">
          <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 rounded-full">
            Today
          </span>
        </div>

        {/* Messages */}
        {messages.map((message) => (
          <MessageBubble key={message.id} {...message} />
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="size-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="size-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="size-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          {/* Attachment Button */}
          <button
            type="button"
            className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
          >
            <Paperclip className="size-5" />
          </button>

          {/* Text Input */}
          <div className="flex-1">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition-shadow"
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!messageInput.trim() || isSending}
            className="p-3 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white disabled:text-slate-400 rounded-xl transition-colors flex-shrink-0"
          >
            {isSending ? (
              <div className="size-5 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="size-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
