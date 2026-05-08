'use client';

/* cSpell:disable */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * AuthGuard — يحمي الصفحات التي تتطلب تسجيل الدخول
 */
export default function AuthGuard({ children, requiredRole, redirectTo = '/login' }) {
  const { isAuth, role } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuth) {
      router.replace(redirectTo);
      return;
    }

    if (requiredRole && role !== requiredRole) {
      router.replace('/');
    }
  }, [mounted, isAuth, role, requiredRole, redirectTo, router]);

  // حالة التحميل أثناء الـ Hydration
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

  if (!isAuth || (requiredRole && role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}