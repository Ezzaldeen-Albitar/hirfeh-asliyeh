'use client';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { selectCurrentUser, selectIsAuth, selectRole, logout, updateUser } from '@/store/slices/authSlice';

function decodeTokenRole(token) {
  if (!token) return null;

  try {
    const [, payload = ''] = token.split('.');
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const parsed = JSON.parse(window.atob(padded));
    return typeof parsed?.role === 'string' ? parsed.role : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const dispatch = useDispatch();
  const router   = useRouter();
  const user     = useSelector(selectCurrentUser);
  const isAuth   = useSelector(selectIsAuth);
  const storedRole = useSelector(selectRole);
  const token = typeof window !== 'undefined' ? Cookies.get('token') : null;
  const tokenRole = typeof window !== 'undefined' ? decodeTokenRole(token) : null;
  const role = tokenRole || storedRole;
  const isAuthenticated = isAuth || Boolean(token);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const handleUpdateUser = (data) => dispatch(updateUser(data));

  const isArtisan  = role === 'artisan';
  const isAdmin    = role === 'admin';
  const isCustomer = role === 'customer';

  return {
    user,
    isAuth: isAuthenticated,
    role,
    isArtisan,
    isAdmin,
    isCustomer,
    logout: handleLogout,
    updateUser: handleUpdateUser,
  };
}
