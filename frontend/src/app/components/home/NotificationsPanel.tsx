import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, UserPlus, Loader2, Check, Star } from 'lucide-react';
import { toast } from 'sonner';

import { API_BASE_URL } from "../../../utils/auth";

interface Notification {
  _id: string;
  sender: {
    userId: string;
    fullName: string;
    profilePicture?: string;
    role: string;
  };
  type: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsPanelProps {
  onUserSelect?: (userId: string) => void;
}

export function NotificationsPanel({ onUserSelect }: NotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewNotification, setSelectedReviewNotification] = useState<Notification | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread count on mount and periodically
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notifications?limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      } else {
        toast.error('Failed to load notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Error loading notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    if (notification.type === 'review' && notification.relatedId) {
      setSelectedReviewNotification(notification);
      setReviewRating(5);
      setReviewText('');
      setShowReviewModal(true);
      setIsOpen(false);
      return;
    }

    if (notification.type === 'follow' && onUserSelect) {
      onUserSelect(notification.sender.userId);
      setIsOpen(false);
    }
  };

  const submitOrganizerReview = async () => {
    if (!selectedReviewNotification?.relatedId) {
      return;
    }

    const cleanedText = reviewText.trim();
    if (!cleanedText) {
      toast.error('Please enter review text before submitting');
      return;
    }

    setIsSubmittingReview(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/reviews/trips/${selectedReviewNotification.relatedId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          organizerReview: {
            rating: reviewRating,
            text: cleanedText,
          },
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        toast.error(data?.message || 'Failed to submit review');
        return;
      }

      setNotifications((prev) => prev.filter((item) => item._id !== selectedReviewNotification._id));
      setShowReviewModal(false);
      setSelectedReviewNotification(null);
      toast.success('Review submitted successfully');
      fetchUnreadCount();
    } catch (error) {
      console.error('Error submitting organizer review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="size-4 text-teal-500" />;
      default:
        return <Bell className="size-4 text-slate-500" />;
    }
  };

  return (
    <>
      <div ref={panelRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
      >
        <Bell className="size-5 text-slate-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 size-2 bg-teal-500 rounded-full animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {unreadCount} unread
                </p>
              )}
            </div>
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <Check className="size-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="size-6 animate-spin text-teal-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="size-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {notifications.map((notification) => (
                  <button
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left ${
                      !notification.isRead ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Sender Profile Picture */}
                      <div
                        className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden"
                        style={notification.sender.profilePicture ? {
                          backgroundImage: `url(${notification.sender.profilePicture})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        } : {}}
                      >
                        {!notification.sender.profilePicture && (
                          <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">
                            {notification.sender.fullName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          {getNotificationIcon(notification.type)}
                          <p className="text-sm text-slate-900 dark:text-white flex-1">
                            <span className="font-medium">
                              {notification.sender.fullName}
                            </span>{' '}
                            {notification.type === 'follow' ? 'started following you' : notification.message}
                          </p>
                          {!notification.isRead && (
                            <span className="size-2 bg-teal-500 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {getTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {showReviewModal && selectedReviewNotification && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Rate Organizer</h3>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedReviewNotification(null);
                }}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="size-4 text-slate-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {selectedReviewNotification.message}
              </p>

              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">Your Rating</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setReviewRating(value)}
                      className="p-1"
                    >
                      <Star
                        className={`size-5 ${value <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Review
                </label>
                <textarea
                  rows={4}
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  placeholder="Share your trip experience with this organizer"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedReviewNotification(null);
                }}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={submitOrganizerReview}
                disabled={isSubmittingReview}
                className="px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 disabled:bg-teal-300"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
