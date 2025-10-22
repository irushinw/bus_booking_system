"use client";

import { useEffect, useState } from "react";
import { Bell, Clock, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchDriverNotifications, markNotificationAsRead } from "@/lib/firebase/firestore";
import type { DriverNotification } from "@/types/firestore";

export function NotificationDrawer() {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<DriverNotification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.uid && role === "driver") {
      loadNotifications();
    }
  }, [user?.uid, role]);

  const loadNotifications = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const notificationData = await fetchDriverNotifications(user.uid);
      setNotifications(notificationData);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: DriverNotification) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Only show for drivers
  if (role !== "driver") return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-xs text-destructive-foreground flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-popover p-4 shadow-lg z-40">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mt-4 max-h-64 overflow-y-auto">
              {loading ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`cursor-pointer rounded-lg border p-3 transition hover:bg-muted ${
                        !notification.isRead ? "bg-yellow-400/5 border-yellow-400/20" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {notification.createdAt.toLocaleDateString()} at{" "}
                              {notification.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-yellow-400 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 5 && (
              <div className="border-t pt-2 mt-2">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-sm text-primary hover:underline"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}