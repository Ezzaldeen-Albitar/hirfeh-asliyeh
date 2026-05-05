'use client';
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { selectIsAuth } from '@/store/slices/authSlice';
import Cookies from 'js-cookie';

export function useSocket() {
  const socketRef = useRef(null);
  const isAuth    = useSelector(selectIsAuth);

  useEffect(() => {
    if (!isAuth) return;
    const token = Cookies.get('token');
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });
    return () => { socketRef.current?.disconnect(); };
  }, [isAuth]);

  return socketRef.current;
}
