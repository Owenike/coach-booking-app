import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const token = req.cookies.get('sb-access-token');

  const protectedPaths = ['/member', '/coach', '/manager'];
  const isProtected = protectedPaths.some((path) => url.pathname.startsWith(path));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/member/:path*', '/coach/:path*', '/manager/:path*'],
};
