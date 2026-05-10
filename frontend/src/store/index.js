import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { baseApi }            from './api/baseApi';
import authReducer, { hydrateAuth, logout, setCredentials } from './slices/authSlice';
import cartReducer            from './slices/cartSlice';
import notificationReducer    from './slices/notificationSlice';
import uiReducer              from './slices/uiSlice';

import './api/authApi';
import './api/productsApi';
import './api/artisansApi';
import './api/ordersApi';
import './api/reviewsApi';
import './api/customizationsApi';
import './api/notificationsApi';
import './api/workshopsApi';
import './api/adminApi';
import './api/wishlistApi';

const authListener = createListenerMiddleware();
let lastAuthKey = null;

authListener.startListening({
  matcher: isAnyOf(setCredentials, hydrateAuth, logout),
  effect: (action, api) => {
    const payload = action.payload || {};
    const nextKey =
      action.type === logout.type
        ? null
        : `${payload.token || ''}:${payload.user?._id || payload.user?.id || ''}`;

    if (lastAuthKey !== null && nextKey !== lastAuthKey) {
      api.dispatch(baseApi.util.resetApiState());
    }

    lastAuthKey = nextKey;
  },
});

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth:          authReducer,
    cart:          cartReducer,
    notifications: notificationReducer,
    ui:            uiReducer,
  },
  middleware: (gDM) => gDM().prepend(authListener.middleware).concat(baseApi.middleware),
});
