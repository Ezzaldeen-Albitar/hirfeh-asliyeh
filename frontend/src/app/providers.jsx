'use client';
import { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Provider, useDispatch } from 'react-redux';
import { store } from '@/store';
import { hydrateAuth, logout, setCredentials } from '@/store/slices/authSlice';
import { hydrateCart } from '@/store/slices/cartSlice';
import { useSocket } from '@/hooks/useSocket';
import { useGetMeQuery } from '@/store/api/authApi';
import Cookies from 'js-cookie';

function HydrateStore() {
  useEffect(() => {
    // ✅ FIX 6: هاد الكود شغّال على الكلاينت فقط (داخل useEffect)
    // بس بنضيف حماية إضافية لو localStorage أو Cookies مش موجودين (مثل بعض البيئات المقيّدة)

    // Auth hydration
    try {
      const token = Cookies.get('token');
      // ✅ تأكد إن localStorage موجود (SSR-safe)
      const raw   = typeof window !== 'undefined' ? localStorage.getItem('ha_user') : null;
      const user  = raw ? JSON.parse(raw) : null;
      if (token && user) {
        store.dispatch(hydrateAuth({ user, token, isAuthenticated: true, role: user.role }));
      } else if (!token) {
        store.dispatch(logout());
      }
    } catch (e) {
      // لو صار خطأ في الـ parse أو الـ cookie، ابدأ نظيف
      console.warn('[HydrateStore] auth hydration failed:', e);
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('ha_user');
        }
      } catch {
      }
    }

    // Cart hydration
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
  const { data, error } = useGetMeQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (!token || !data?.user) return;

    const mappedUser = mapSessionUser(data);
    if (!mappedUser) return;

    dispatch(setCredentials({ user: mappedUser, token }));
  }, [data, dispatch, token]);

  useEffect(() => {
    const status = error?.status;
    if (status === 401 || status === 403) {
      dispatch(logout());
    }
  }, [dispatch, error]);

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
