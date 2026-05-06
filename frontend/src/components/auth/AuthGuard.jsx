'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * AuthGuard — يحمي الصفحات التي تتطلب تسجيل الدخول
 *
 * Props:
 *   requiredRole?: 'artisan' | 'admin' | 'customer'  — اختياري، يقيّد الدخول بدور معين
 *   redirectTo?:  string                              — مسار التوجيه عند الفشل (افتراضي: /login)
 */
export default function AuthGuard({ children, requiredRole, redirectTo = '/login' }) {
  const { isAuth, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuth) {
      router.replace(redirectTo);
      return;
    }
    if (requiredRole && role !== requiredRole) {
      // مسجّل دخول لكن ليس له الصلاحية
      router.replace('/');
    }
  }, [isAuth, role, requiredRole, redirectTo, router]);

  // لا نعرض شيئاً أثناء التحقق / إعادة التوجيه
  if (!isAuth) return null;
  if (requiredRole && role !== requiredRole) return null;

  return <>{children}</>;
}
