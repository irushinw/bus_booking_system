"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { 
  closeNotificationDrawer, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  removeNotification 
} from '../../store/slices/uiSlice';
import { 
  FaTimes, 
  FaCheck, 
  FaTrash, 
  FaBell, 
  FaExclamationCircle,
  FaCheckCircle,
  FaRoute,
  FaInfoCircle
} from 'react-icons/fa';

const NotificationDrawer = () => {
  const dispatch = useDispatch();
  const { isNotificationDrawerOpen, notifications, unreadCount } = useSelector(
    (state: RootState) => state.ui
  );

  // Debug log to see if the component is working
  console.log('NotificationDrawer rendered, isOpen:', isNotificationDrawerOpen);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <FaBell className="w-4 h-4 text-blue-500" />;
      case 'payment':
        return <FaCheckCircle className="w-4 h-4 text-green-500" />;
      case 'route':
        return <FaRoute className="w-4 h-4 text-orange-500" />;
      default:
        return <FaInfoCircle className="w-4 h-4 text-primary" />;
    }
  };

  const handleMarkAsRead = (id: number) => {
    dispatch(markNotificationAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleRemoveNotification = (id: number) => {
    dispatch(removeNotification(id));
  };

  return (
    <AnimatePresence>
      {isNotificationDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => dispatch(closeNotificationDrawer())}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-2xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <FaBell className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-card-foreground">Notifications</h2>
                  <p className="text-sm text-muted-foreground">
                    {unreadCount} unread notifications
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => dispatch(closeNotificationDrawer())}
                className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <FaTimes className="w-4 h-4 text-secondary-foreground" />
              </motion.button>
            </div>

            {/* Actions */}
            {unreadCount > 0 && (
              <div className="p-4 border-b border-border">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleMarkAllAsRead}
                  className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <FaCheck className="w-4 h-4" />
                  Mark all as read
                </motion.button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                    <FaBell className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">
                    No notifications
                  </h3>
                  <p className="text-muted-foreground">
                    You're all caught up! Check back later for new updates.
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl border transition-all ${
                        notification.unread 
                          ? 'bg-primary/5 border-primary/20 shadow-sm' 
                          : 'bg-secondary/30 border-border hover:bg-secondary/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-card-foreground mb-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.time}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {notification.unread && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center hover:bg-primary/30 transition-colors"
                              title="Mark as read"
                            >
                              <FaCheck className="w-3 h-3 text-primary" />
                            </motion.button>
                          )}
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRemoveNotification(notification.id)}
                            className="w-6 h-6 bg-destructive/20 rounded-full flex items-center justify-center hover:bg-destructive/30 transition-colors"
                            title="Remove notification"
                          >
                            <FaTrash className="w-3 h-3 text-destructive" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Notifications are updated in real-time
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationDrawer; 