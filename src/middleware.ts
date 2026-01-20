import { auth } from '@/lib/auth/config';
import { NextResponse } from 'next/server';

const protectedRoutes = ['/today', '/schedule', '/stats', '/profile', '/inbox'];
const authRoutes = ['/login'];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/today', nextUrl));
  }

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
