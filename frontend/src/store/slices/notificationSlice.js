import { createSlice } from '@reduxjs/toolkit';

function normalizeNotification(payload) {
  return {
    _id: payload?._id,
    title: payload?.title || '',
    body: payload?.body || payload?.message || '',
    message: payload?.message || payload?.body || payload?.title || 'إشعار جديد',
    time: payload?.time || payload?.createdAt,
    link: payload?.link,
    type: payload?.type || 'general',
    read: payload?.read ?? payload?.isRead ?? false,
    isRead: payload?.isRead ?? payload?.read ?? false,
    createdAt: payload?.createdAt,
    data: payload?.data || {},
  };
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unread: 0 },
  reducers: {
    addNotification: (state, { payload }) => {
      const item = normalizeNotification(payload);
      const existingIndex = item._id
        ? state.items.findIndex((notification) => notification._id === item._id)
        : -1;

      if (existingIndex >= 0) {
        state.items[existingIndex] = item;
      } else {
        state.items.unshift(item);
      }

      state.unread = state.items.filter((notification) => !(notification.read || notification.isRead)).length;
    },
    setNotifications: (state, { payload }) => {
      state.items = (payload || []).map(normalizeNotification);
      state.unread = state.items.filter((notification) => !(notification.read || notification.isRead)).length;
    },
    markRead: (state, { payload }) => {
      state.items = state.items.map((notification) =>
        notification._id === payload
          ? { ...notification, read: true, isRead: true }
          : notification
      );
      state.unread = state.items.filter((notification) => !(notification.read || notification.isRead)).length;
    },
    markAllRead: (state) => {
      state.items = state.items.map((notification) => ({ ...notification, read: true, isRead: true }));
      state.unread = 0;
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unread = 0;
    },
  },
});

export const { addNotification, setNotifications, markRead, markAllRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
