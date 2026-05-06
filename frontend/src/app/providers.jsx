'use client';
import { useEffect }  from 'react';
import { Provider }   from 'react-redux';
import { store }      from '@/store';
import { hydrateAuth } from '@/store/slices/authSlice';
import { hydrateCart } from '@/store/slices/cartSlice';
import Cookies from 'js-cookie';

function HydrateStore() {
  useEffect(() => {
    // Auth hydration — كلاينت فقط
    try {
      const token = Cookies.get('token');
      const user  = JSON.parse(localStorage.getItem('ha_user') || 'null');
      if (token && user) {
        store.dispatch(hydrateAuth({ user, token, isAuthenticated: true, role: user.role }));
      }
    } catch {}

    // Cart hydration — كلاينت فقط
    try {
      const items = JSON.parse(localStorage.getItem('ha_cart') || '[]');
      store.dispatch(hydrateCart(items));
    } catch {
      store.dispatch(hydrateCart([]));
    }
  }, []);

  return null;
}

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <HydrateStore />
      {children}
    </Provider>
  );
}