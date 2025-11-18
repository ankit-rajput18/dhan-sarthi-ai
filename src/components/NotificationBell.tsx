import { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '@/lib/timeUtils';

interface Notification {
  _id: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  category: string;
  title: string;
  message: string;
  potentialSaving?: number;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ds_auth_token') || localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/notifications?limit=20&includeRead=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('ds_auth_token') || localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const dismissNotification = async (id: string) => {
    try {
      const token = localStorage.getItem('ds_auth_token') || localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n._id !== id));
        if (!notifications.find(n => n._id === id)?.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('ds_auth_token') || localStorage.getItem('token');
      if (!token) return;

      const notification = notifications.find(n => n._id === id);
      if (notification?.read) return;

      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => 
          n._id === id ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('ds_auth_token') || localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Poll for new notifications every 15 seconds for better real-time feel
    const interval = setInterval(() => {
      fetchUnreadCount();
      // Also refresh notifications if popover is open
      if (open) {
        fetchNotifications();
      }
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'warning':
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: string, read: boolean) => {
    const opacity = read ? 'opacity-60' : '';
    switch (type) {
      case 'success':
        return `bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800 ${opacity}`;
      case 'warning':
        return `bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800 ${opacity}`;
      case 'danger':
        return `bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800 ${opacity}`;
      default:
        return `bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800 ${opacity}`;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transaction':
        return '💳';
      case 'budget':
        return '💰';
      case 'tax':
        return '📊';
      case 'loan':
        return '🏦';
      case 'goal':
        return '🎯';
      case 'savings':
        return '💡';
      default:
        return '🔔';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification._id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-600"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Notifications</h3>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-sm">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-600 opacity-50" />
              <p className="text-sm">No notifications</p>
              <p className="text-xs mt-1">You're all caught up!</p>
              <p className="text-xs mt-2 opacity-70">Notifications auto-delete after 7 days or when you have more than 15</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-l-4 ${getBgColor(notification.type, notification.read)} cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full absolute left-2 top-6"></div>
                      )}
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{getCategoryIcon(notification.category)}</span>
                            <h4 className={`font-semibold text-sm ${notification.read ? 'text-muted-foreground' : ''}`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <Badge variant="secondary" className="text-xs ml-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(notification._id);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      {notification.potentialSaving != null && notification.potentialSaving > 0 ? (
                        <div className="mt-2 flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            💰 Save ₹{notification.potentialSaving.toLocaleString('en-IN')}
                          </Badge>
                        </div>
                      ) : null}
                      {notification.priority === 'high' && !notification.read ? (
                        <Badge variant="destructive" className="mt-2 text-xs">
                          High Priority
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="p-3 border-t bg-muted/30 text-center">
            <p className="text-xs text-muted-foreground">
              Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''} • Auto-deleted after 7 days or when exceeding 15
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
