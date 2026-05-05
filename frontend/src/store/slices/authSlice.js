import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  role: null, // 'customer' | 'artisan' | 'admin'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      state.user  = payload.user;
      state.token = payload.token;
      state.isAuthenticated = true;
      state.role  = payload.user?.role;
      Cookies.set('token', payload.token, { expires: 7 });
    },
    logout: (state) => {
      state.user  = null;
      state.token = null;
      state.isAuthenticated = false;
      state.role  = null;
      Cookies.remove('token');
    },
    updateUser: (state, { payload }) => {
      state.user = { ...state.user, ...payload };
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser  = (s) => s.auth.user;
export const selectIsAuth       = (s) => s.auth.isAuthenticated;
export const selectRole         = (s) => s.auth.role;
