import { configureStore } from '@reduxjs/toolkit';
import { baseApi }            from './api/baseApi';
import authReducer            from './slices/authSlice';
import cartReducer            from './slices/cartSlice';
import notificationReducer    from './slices/notificationSlice';
import uiReducer              from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth:          authReducer,
    cart:          cartReducer,
    notifications: notificationReducer,
    ui:            uiReducer,
  },
  middleware: (gDM) => gDM().concat(baseApi.middleware),
});
