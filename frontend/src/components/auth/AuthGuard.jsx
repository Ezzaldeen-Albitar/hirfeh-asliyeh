'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuth } from '@/hooks/useAuth';

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

function resolveRoleRedirect(role) {
  if (role === 'admin') return '/admin';
  if (role === 'artisan') return '/dashboard/artisan';
  return '/';
}

export default function AuthGuard({ children, requiredRole, redirectTo = '/login' }) {
  const { isAuth, role } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const token = mounted ? Cookies.get('token') : null;
  const tokenRole = mounted ? decodeTokenRole(token) : null;
  const effectiveRole = tokenRole || role;
  const isAuthenticated = isAuth || Boolean(token);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    if (requiredRole && effectiveRole !== requiredRole) {
      router.replace(resolveRoleRedirect(effectiveRole));
    }
  }, [mounted, isAuthenticated, effectiveRole, requiredRole, redirectTo, router]);

  if (!mounted) {
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

  if (!isAuthenticated || (requiredRole && effectiveRole !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
