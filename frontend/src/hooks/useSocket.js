'use client';

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuth } from '@/store/slices/authSlice';
import { addNotification } from '@/store/slices/notificationSlice';
import Cookies from 'js-cookie';
import { clearActiveSocket, setActiveSocket } from '@/lib/socketClient';

export function useSocket() {
  const socketRef = useRef(null);
  const isAuth = useSelector(selectIsAuth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuth) {
      socketRef.current?.disconnect();
      clearActiveSocket(socketRef.current);
      socketRef.current = null;
      return;
    }

    const token = Cookies.get('token');
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!socketUrl) {
      return;
    }

    const socket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;
    setActiveSocket(socket);

    socket.on('notification:new', (data) => {
      dispatch(addNotification(data));
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      clearActiveSocket(socket);
      socketRef.current = null;
    };
  }, [isAuth, dispatch]);

  return socketRef;
}
