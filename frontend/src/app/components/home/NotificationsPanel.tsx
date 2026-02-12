import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, UserPlus, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

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
      const response = await fetch('http://localhost:5000/api/notifications/unread-count', {
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
      const response = await fetch('http://localhost:5000/api/notifications?limit=20', {
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
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
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
      const response = await fetch('http://localhost:5000/api/notifications/read-all', {
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
    if (notification.type === 'follow' && onUserSelect) {
      onUserSelect(notification.sender.userId);
      setIsOpen(false);
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
  );
}
