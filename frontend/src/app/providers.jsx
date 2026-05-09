'use client';
import { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Provider }  from 'react-redux';
import { store }     from '@/store';
import { hydrateAuth } from '@/store/slices/authSlice';
import { hydrateCart } from '@/store/slices/cartSlice';
import { useSocket } from '@/hooks/useSocket';
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
      }
    } catch (e) {
      // لو صار خطأ في الـ parse أو الـ cookie، ابدأ نظيف
      console.warn('[HydrateStore] auth hydration failed:', e);
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

function SocketBootstrap() {
  useSocket();
  return null;
}

export default function Providers({ children }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  const content = (
    <Provider store={store}>
      <HydrateStore />
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
