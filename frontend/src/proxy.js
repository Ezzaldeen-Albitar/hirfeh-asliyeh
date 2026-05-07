import { NextResponse } from 'next/server';

const PROTECTED = ['/dashboard', '/checkout', '/customizations'];

// ✅ Next.js 16: export must be named "proxy" (not "middleware")
export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Admin routes → redirect to admin login if no token
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Protected user routes → redirect to login if no token
  if (!token && PROTECTED.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/checkout', '/customizations/:path*', '/admin/:path*'],
};