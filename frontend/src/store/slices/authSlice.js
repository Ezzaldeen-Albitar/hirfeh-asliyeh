import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const loadFromStorage = () => {
  if (typeof window === 'undefined') return { user: null, token: null, isAuthenticated: false, role: null };
  try {
    const token = Cookies.get('token');
    const user  = JSON.parse(localStorage.getItem('ha_user') || 'null');
    if (token && user) return { user, token, isAuthenticated: true, role: user.role };
  } catch {}
  return { user: null, token: null, isAuthenticated: false, role: null };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: loadFromStorage(),
  reducers: {
    setCredentials: (state, { payload }) => {
      state.user            = payload.user;
      state.token           = payload.token;
      state.isAuthenticated = true;
      state.role            = payload.user?.role;
      Cookies.set('token', payload.token, { expires: 7 });
      try { localStorage.setItem('ha_user', JSON.stringify(payload.user)); } catch {}
    },
    logout: (state) => {
      state.user = null; state.token = null;
      state.isAuthenticated = false; state.role = null;
      Cookies.remove('token');
      try { localStorage.removeItem('ha_user'); } catch {}
    },
    updateUser: (state, { payload }) => {
      state.user = { ...state.user, ...payload };
      try { localStorage.setItem('ha_user', JSON.stringify(state.user)); } catch {}
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (s) => s.auth.user;
export const selectIsAuth      = (s) => s.auth.isAuthenticated;
export const selectRole        = (s) => s.auth.role;
