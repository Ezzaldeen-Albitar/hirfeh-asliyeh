'use client';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { selectCurrentUser, selectIsAuth, selectRole, logout, updateUser } from '@/store/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const router   = useRouter();
  const user     = useSelector(selectCurrentUser);
  const isAuth   = useSelector(selectIsAuth);
  const role     = useSelector(selectRole);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const handleUpdateUser = (data) => dispatch(updateUser(data));

  const isArtisan  = role === 'artisan';
  const isAdmin    = role === 'admin';
  const isCustomer = role === 'customer';

  return { user, isAuth, role, isArtisan, isAdmin, isCustomer, logout: handleLogout, updateUser: handleUpdateUser };
}
