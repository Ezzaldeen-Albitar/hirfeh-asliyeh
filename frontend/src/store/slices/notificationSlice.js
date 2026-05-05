import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unread: 0 },
  reducers: {
    addNotification: (state, { payload }) => {
      state.items.unshift(payload);
      state.unread += 1;
    },
    markAllRead: (state) => {
      state.items = state.items.map(n => ({ ...n, read: true }));
      state.unread = 0;
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unread = 0;
    },
  },
});

export const { addNotification, markAllRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
