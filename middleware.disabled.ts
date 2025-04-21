import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('🔥 middleware ejecutado en:', request.nextUrl.pathname);

  const accessToken = request.cookies.get('accessToken')?.value;
  const isLoggedIn = !!accessToken;

  const isProtectedPath = request.nextUrl.pathname.startsWith('/(protected)/dashboard') ||
                          request.nextUrl.pathname.startsWith('/(protected)/incomes') ||
                          request.nextUrl.pathname.startsWith('/(protected)/expenses') ||
                          request.nextUrl.pathname.startsWith('/(protected)/saving-goals') ||
                          request.nextUrl.pathname.startsWith('/(protected)/reflections') ||
                          request.nextUrl.pathname.startsWith('/(protected)/admin-panel');

  if (!isLoggedIn && isProtectedPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/(protected)/dashboard/:path*',
    '/(protected)/incomes/:path*',
    '/(protected)/expenses/:path*',
    '/(protected)/saving-goals/:path*',
    '/(protected)/reflections/:path*',
    '/(protected)/admin-panel/:path*',
  ],
};
