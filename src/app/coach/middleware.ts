import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // 只保護以下路徑
  const protectedPaths = ['/coach', '/manager', '/member'];
  if (!protectedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 取得 Supabase Session
  const accessToken = req.cookies.get('sb-access-token')?.value;
  const refreshToken = req.cookies.get('sb-refresh-token')?.value;

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user?.phone) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const phone = user.phone;

  // 權限對應
  const routeRoles: Record<string, string> = {
    '/coach': '0912345678',
    '/manager': '0912345679',
    '/member': '0912345670'
  };

  for (const [route, allowedPhone] of Object.entries(routeRoles)) {
    if (pathname.startsWith(route) && phone !== allowedPhone) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

// 告訴 Next.js 哪些路由會使用 middleware（只針對 app router 頁面）
export const config = {
  matcher: ['/coach/:path*', '/manager/:path*', '/member/:path*']
};
