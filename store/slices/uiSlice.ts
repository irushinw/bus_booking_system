import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: number;
  message: string;
  time: string;
  unread: boolean;
  type: 'booking' | 'payment' | 'route' | 'general';
}

interface UIState {
  isNotificationDrawerOpen: boolean;
  isProfileMenuOpen: boolean;
  notifications: Notification[];
  unreadCount: number;
}

const initialState: UIState = {
  isNotificationDrawerOpen: false,
  isProfileMenuOpen: false,
  notifications: [
    { id: 1, message: 'New booking request', time: '2 min ago', unread: true, type: 'booking' },
    { id: 2, message: 'Payment received', time: '1 hour ago', unread: true, type: 'payment' },
    { id: 3, message: 'Route update', time: '3 hours ago', unread: false, type: 'route' },
    { id: 4, message: 'Welcome to BusBooking!', time: '1 day ago', unread: false, type: 'general' },
  ],
  unreadCount: 2,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleNotificationDrawer: (state) => {
      state.isNotificationDrawerOpen = !state.isNotificationDrawerOpen;
    },
    closeNotificationDrawer: (state) => {
      state.isNotificationDrawerOpen = false;
    },
    toggleProfileMenu: (state) => {
      state.isProfileMenuOpen = !state.isProfileMenuOpen;
    },
    closeProfileMenu: (state) => {
      state.isProfileMenuOpen = false;
    },
    markNotificationAsRead: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && notification.unread) {
        notification.unread = false;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.unread = false;
      });
      state.unreadCount = 0;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const newNotification: Notification = {
        ...action.payload,
        id: Date.now(),
      };
      state.notifications.unshift(newNotification);
      if (newNotification.unread) {
        state.unreadCount += 1;
      }
    },
    removeNotification: (state, action: PayloadAction<number>) => {
      const notificationIndex = state.notifications.findIndex(n => n.id === action.payload);
      if (notificationIndex !== -1) {
        const notification = state.notifications[notificationIndex];
        if (notification.unread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(notificationIndex, 1);
      }
    },
  },
});

export const {
  toggleNotificationDrawer,
  closeNotificationDrawer,
  toggleProfileMenu,
  closeProfileMenu,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  addNotification,
  removeNotification,
} = uiSlice.actions;

export default uiSlice.reducer; 