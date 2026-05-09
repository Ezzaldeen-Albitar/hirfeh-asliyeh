'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import {
  markAllRead,
  markRead,
  setNotifications,
} from '@/store/slices/notificationSlice';
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/store/api/notificationsApi';

function formatTime(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  } catch {
    return '';
  }
}

function getNotificationTarget(notification) {
  const requestId = notification?.data?.requestId;
  if (requestId && ['message', 'customization'].includes(notification?.type)) {
    return `/customizations?request=${requestId}`;
  }

  return notification?.link;
}

export default function NotificationBell() {
  const { items, unread } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const router = useRouter();
  const { data } = useGetNotificationsQuery();
  const [markAllNotificationsRead] = useMarkAllNotificationsReadMutation();
  const [markNotificationRead] = useMarkNotificationReadMutation();

  useEffect(() => {
    if (data?.notifications) {
      dispatch(setNotifications(data.notifications));
    }
  }, [data, dispatch]);

  const handleMarkAllRead = async () => {
    if (unread <= 0) return;
    dispatch(markAllRead());
    try {
      await markAllNotificationsRead().unwrap();
    } catch {
    }
  };

  const handleOpenNotification = async (notification) => {
    if (!notification?.read && !notification?.isRead && notification?._id) {
      dispatch(markRead(notification._id));
      try {
        await markNotificationRead(notification._id).unwrap();
      } catch {
      }
    }
    const target = getNotificationTarget(notification);
    if (target) {
      router.push(target, { scroll: true });
    }
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-sm position-relative navbar-icon-btn"
        data-bs-toggle="dropdown"
        aria-label="الإشعارات"
        suppressHydrationWarning
      >
        <i className="bi bi-bell" />
        {unread > 0 && (
          <span
            className="position-absolute top-0 start-0 translate-middle badge rounded-pill"
            style={{ background: 'var(--burgundy)', fontSize: '0.6rem' }}
          >
            {unread}
          </span>
        )}
      </button>

      <div
        className="dropdown-menu dropdown-menu-start p-0 border-0 shadow"
        style={{ borderRadius: 14, minWidth: 320, maxHeight: 380, overflowY: 'auto' }}
      >
        <div
          className="p-3 border-bottom d-flex justify-content-between align-items-center"
          style={{ borderColor: 'var(--stone)' }}
        >
          <strong style={{ fontFamily: 'Amiri,serif', fontSize: '1rem' }}>الإشعارات</strong>
          {items.some((notification) => !(notification.read || notification.isRead)) && (
            <small
              style={{ color: 'var(--burgundy)', cursor: 'pointer', fontWeight: 600 }}
              onClick={handleMarkAllRead}
            >
              تحديد الكل كمقروء
            </small>
          )}
        </div>

        {items.length === 0 ? (
          <div className="p-4 text-center" style={{ color: 'var(--warm-gray)' }}>
            <i className="bi bi-bell-slash fs-3 d-block mb-2" />
            لا توجد إشعارات
          </div>
        ) : (
          items.slice(0, 8).map((notification) => (
            <button
              key={notification._id || `${notification.message}-${notification.time}`}
              type="button"
              className="w-100 text-start p-3 border-bottom bg-transparent"
              onClick={() => handleOpenNotification(notification)}
              style={{
                background: notification.read || notification.isRead ? '#fff' : 'rgba(184,150,60,0.06)',
                borderColor: 'var(--gold-pale)',
                fontSize: '0.85rem',
                borderInline: 'none',
              }}
            >
              <div className="fw-500">{notification.title || notification.message}</div>
              {notification.body && (
                <div style={{ color: 'var(--warm-gray)', marginTop: 4 }}>{notification.body}</div>
              )}
              <small style={{ color: 'var(--warm-gray)' }}>
                {formatTime(notification.createdAt || notification.time)}
              </small>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
