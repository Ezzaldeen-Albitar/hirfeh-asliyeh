import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  role: null,
  isReady: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      state.user            = payload.user || null;
      state.token           = payload.token || null;
      state.isAuthenticated = Boolean(payload.user);
      state.role            = payload.user?.role;
      state.isReady         = true;
      if (payload.token) {
        Cookies.set('token', payload.token, { expires: 7 });
      }
      try { localStorage.setItem('ha_user', JSON.stringify(payload.user)); } catch {}
    },
    logout: (state) => {
      state.user = null; state.token = null;
      state.isAuthenticated = false; state.role = null; state.isReady = true;
      Cookies.remove('token');
      try { localStorage.removeItem('ha_user'); } catch {}
    },
    updateUser: (state, { payload }) => {
      state.user = { ...state.user, ...payload };
      try { localStorage.setItem('ha_user', JSON.stringify(state.user)); } catch {}
    },
    hydrateAuth: (state, { payload }) => {
      state.user            = payload.user;
      state.token           = payload.token;
      state.isAuthenticated = payload.isAuthenticated;
      state.role            = payload.role;
      state.isReady         = true;
    },
    setAuthReady: (state) => {
      state.isReady = true;
    },
  },
});

export const { setCredentials, logout, updateUser, hydrateAuth, setAuthReady } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (s) => s.auth.user;
export const selectIsAuth      = (s) => s.auth.isAuthenticated;
export const selectRole        = (s) => s.auth.role;
export const selectAuthReady   = (s) => s.auth.isReady;
