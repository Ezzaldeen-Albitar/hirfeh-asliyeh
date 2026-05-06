import { NextResponse } from 'next/server';

// المسارات المحمية وصلاحياتها
const PROTECTED = [
  { path: '/dashboard/artisan', role: 'artisan' },
  { path: '/admin',             role: 'admin'   },
  { path: '/dashboard',         role: null      }, // أي مستخدم مسجّل
  { path: '/checkout',          role: null      },
  { path: '/customizations',    role: null      },
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const rule = PROTECTED.find(r => pathname.startsWith(r.path));
  if (!rule) return NextResponse.next();

  // غير مسجّل → توجيه لصفحة الدخول
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ملاحظة: فحص الـ role الدقيق يحتاج JWT decode هنا
  // حالياً نكتفي بفحص وجود التوكن — الـ AuthGuard على الكلاينت يتحقق من الـ role
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/checkout/:path*',
    '/customizations/:path*',
  ],
};