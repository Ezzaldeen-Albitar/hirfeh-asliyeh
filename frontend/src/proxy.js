import { NextResponse } from 'next/server';

const PROTECTED = ['/dashboard', '/checkout', '/customizations'];

function decodeTokenRole(token) {
  if (!token) return null;

  try {
    const [, payload = ''] = token.split('.');
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const parsed = JSON.parse(atob(padded));
    return typeof parsed?.role === 'string' ? parsed.role : null;
  } catch {
    return null;
  }
}

// ✅ Next.js 16: export must be named "proxy" (not "middleware")
export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const role = decodeTokenRole(token);

  // Admin routes → redirect to admin login if no token
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (pathname.startsWith('/admin') && role && role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protected user routes → redirect to login if no token
  if (!token && PROTECTED.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/dashboard/artisan') && role && role !== 'artisan') {
    return NextResponse.redirect(new URL(role === 'admin' ? '/admin' : '/', request.url));
  }

  if (pathname.startsWith('/checkout') && role && role !== 'customer') {
    return NextResponse.redirect(new URL(role === 'artisan' ? '/dashboard/artisan' : role === 'admin' ? '/admin' : '/', request.url));
  }

  if (pathname.startsWith('/customizations') && role === 'admin') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/checkout', '/customizations/:path*', '/admin/:path*'],
};
