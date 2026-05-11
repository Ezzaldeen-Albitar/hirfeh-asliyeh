'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuth } from '@/hooks/useAuth';

function resolveRoleRedirect(role) {
  if (role === 'admin') return '/admin';
  if (role === 'artisan') return '/dashboard/artisan';
  if (role === 'customer') return '/dashboard';
  return '/login';
}

export default function AuthGuard({ children, requiredRole, redirectTo = '/login' }) {
  const { isAuth, isReady, role } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const hasToken = mounted ? Boolean(Cookies.get('token')) : false;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isReady) return;

    if (!hasToken || !isAuth) {
      router.replace(redirectTo);
      return;
    }

    if (requiredRole && role !== requiredRole) {
      router.replace(resolveRoleRedirect(role));
    }
  }, [hasToken, isAuth, isReady, mounted, redirectTo, requiredRole, role, router]);

  if (!mounted || !isReady) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div
          className="spinner-border text-burgundy"
          style={{ width: '40px', height: '40px' }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!hasToken || !isAuth || (requiredRole && role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
