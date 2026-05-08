'use client';
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuth } from '@/store/slices/authSlice';
import { addNotification } from '@/store/slices/notificationSlice';
import Cookies from 'js-cookie';

export function useSocket() {
  const socketRef = useRef(null);
  const isAuth    = useSelector(selectIsAuth);
  const dispatch  = useDispatch();

  useEffect(() => {
    if (!isAuth) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const token = Cookies.get('token');
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    // ✅ FIX 2: اسمع على الـ events واحفظ الإشعارات في الـ store
    // غيّر أسماء الـ events حسب ما يرسله السيرفر عندك
    socket.on('notification', (data) => {
      dispatch(addNotification({
        message: data.message || data.title || 'إشعار جديد',
        time:    data.time    || new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        read:    false,
        type:    data.type   || 'general',
      }));
    });

    // أحداث شائعة — أضف أو احذف حسب السيرفر
    socket.on('order:updated', (data) => {
      dispatch(addNotification({
        message: `تم تحديث حالة طلبك إلى: ${data.status || ''}`,
        time:    new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        read:    false,
        type:    'order',
      }));
    });

    socket.on('customization:message', (data) => {
      dispatch(addNotification({
        message: `رسالة جديدة في طلب التخصيص`,
        time:    new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        read:    false,
        type:    'customization',
      }));
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuth, dispatch]);

  return socketRef;
}