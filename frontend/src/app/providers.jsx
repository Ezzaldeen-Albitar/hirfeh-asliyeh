'use client';
import { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Provider, useDispatch } from 'react-redux';
import { store } from '@/store';
import { logout, setAuthReady, setCredentials } from '@/store/slices/authSlice';
import { hydrateCart } from '@/store/slices/cartSlice';
import { useSocket } from '@/hooks/useSocket';
import { useGetMeQuery, useLogoutMutation } from '@/store/api/authApi';
import Cookies from 'js-cookie';

function HydrateStore() {
  useEffect(() => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        store.dispatch(logout());
      } else {
        // Always trust the current backend session over any stale local snapshot.
        try {
          localStorage.removeItem('ha_user');
        } catch {
        }
      }
    } catch (e) {
      console.warn('[HydrateStore] auth hydration failed:', e);
      store.dispatch(logout());
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('ha_user');
        }
      } catch {
      }
    }

    try {
      const raw   = typeof window !== 'undefined' ? localStorage.getItem('ha_cart') : null;
      const items = raw ? JSON.parse(raw) : [];
      store.dispatch(hydrateCart(Array.isArray(items) ? items : []));
    } catch (e) {
      console.warn('[HydrateStore] cart hydration failed:', e);
      store.dispatch(hydrateCart([]));
    }
  }, []);

  return null;
}

function mapSessionUser(payload) {
  const user = payload?.user;
  const artisanProfile = payload?.artisanProfile;

  if (!user) return null;

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    isEmailVerified: user.isEmailVerified,
    craftSpecialty:
      artisanProfile?.craftName ||
      artisanProfile?.specialties?.[0] ||
      user.pendingArtisanProfile?.craftSpecialty ||
      '',
    governorate:
      artisanProfile?.region ||
      user.address?.governorate ||
      user.pendingArtisanProfile?.governorate ||
      '',
    bio:
      artisanProfile?.bio ||
      user.pendingArtisanProfile?.bio ||
      '',
    coverImage: artisanProfile?.coverImage || '',
    artisanProfileId: artisanProfile?._id,
  };
}

function AuthSessionSync() {
  const dispatch = useDispatch();
  const token = Cookies.get('token');
  const [logoutRequest] = useLogoutMutation();
  const { data, error, isError, isSuccess } = useGetMeQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (!token || !data?.user) return;

    const mappedUser = mapSessionUser(data);
    if (!mappedUser) return;

    dispatch(setCredentials({ user: mappedUser, token }));
  }, [data, dispatch, token]);

  useEffect(() => {
    if (!token || !isSuccess || data?.user) return;
    dispatch(logout());
  }, [data?.user, dispatch, isSuccess, token]);

  useEffect(() => {
    if (!isError) return;

    const status = error?.status;
    if (status === 401 || status === 403) {
      logoutRequest().catch(() => {});
      dispatch(logout());
      return;
    }

    dispatch(setAuthReady());
  }, [dispatch, error, isError, logoutRequest]);

  return null;
}

function SocketBootstrap() {
  useSocket();
  return null;
}

export default function Providers({ children }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  const content = (
    <Provider store={store}>
      <HydrateStore />
      <AuthSessionSync />
      <SocketBootstrap />
      {children}
    </Provider>
  );

  if (!googleClientId) {
    return content;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {content}
    </GoogleOAuthProvider>
  );
}
