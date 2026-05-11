'use client';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { selectAuthReady, selectCurrentUser, selectIsAuth, selectRole, logout, updateUser } from '@/store/slices/authSlice';
import { useLogoutMutation } from '@/store/api/authApi';

export function useAuth() {
  const dispatch = useDispatch();
  const router   = useRouter();
  const user     = useSelector(selectCurrentUser);
  const isAuth   = useSelector(selectIsAuth);
  const role     = useSelector(selectRole);
  const isReady  = useSelector(selectAuthReady);
  const [logoutRequest] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutRequest().unwrap();
    } catch {
    } finally {
      dispatch(logout());
      router.push('/login');
      router.refresh();
    }
  };

  const handleUpdateUser = (data) => dispatch(updateUser(data));

  const isArtisan  = role === 'artisan';
  const isAdmin    = role === 'admin';
  const isCustomer = role === 'customer';

  return {
    user,
    isAuth,
    role,
    isReady,
    isArtisan,
    isAdmin,
    isCustomer,
    logout: handleLogout,
    updateUser: handleUpdateUser,
  };
}
