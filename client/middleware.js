// Next.js Middleware - Route Protection
// This middleware blocks access to protected routes without login

import { NextResponse } from 'next/server';

export function middleware(request) {
  // Check token from cookie
  const token = request.cookies.get('token')?.value;

  // List of protected routes - login is required for these
  const protectedPaths = ['/dashboard', '/tasks', '/profile', '/notifications'];

  // Auth routes - redirect logged in users from here
  const authPaths = ['/login', '/register'];

  const { pathname } = request.nextUrl;

  // Check if current path is protected
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // If it's a protected route and there is no token, redirect to login
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If it's an auth route and there is a token, redirect to dashboard
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Middleware sirf specific paths pe chalao
export const config = {
  matcher: ['/dashboard/:path*', '/tasks/:path*', '/profile/:path*', '/notifications/:path*', '/login', '/register'],
};
