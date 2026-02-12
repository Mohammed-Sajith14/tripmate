import { Send, Paperclip, Info, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isSent: boolean;
  isRead?: boolean;
}

interface ChatWindowProps {
  conversation: {
    id: string;
    name: string;
    userId: string;
    role: "traveler" | "organizer";
    messages: Message[];
    tripContext?: {
      tripName: string;
      destination: string;
    } | null;
  } | null;
  onBack: () => void;
  onShowInfo: () => void;
  onViewTrip?: () => void;
}

export function ChatWindow({
  conversation,
  onBack,
  onShowInfo,
  onViewTrip,
}: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages when conversation changes
  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages);
    }
  }, [conversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (messages.length > 0 && !messages[messages.length - 1].isSent) {
      const typingTimeout = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
      return () => clearTimeout(typingTimeout);
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && conversation) {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: messageInput.trim(),
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        isSent: true,
        isRead: false,
      };

      setMessages([...messages, newMessage]);
      setMessageInput("");

      // Simulate response (demo mode)
      setIsTyping(true);
      setTimeout(() => {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          content: "Thank you for your message! I'll get back to you shortly.",
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
          isSent: false,
        };
        setMessages((prev) => [...prev, response]);
        setIsTyping(false);
      }, 2000);
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
                {conversation.userId.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* User Info */}
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {conversation.name}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    conversation.role === "organizer"
                      ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {conversation.role === "organizer" ? "Organizer" : "Traveler"}
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
            disabled={!messageInput.trim()}
            className="p-3 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white disabled:text-slate-400 rounded-xl transition-colors flex-shrink-0"
          >
            <Send className="size-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
