import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE_NAME = 'barter_session';

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ||
    'barter_jwt_secret_development_key_min_32_bytes_super_secure_2026!';
  return new TextEncoder().encode(secret);
}

// Ścieżki wymagające uwierzytelnienia
const PROTECTED_ROUTES = ['/dashboard', '/items/new'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Sprawdź, czy ścieżka jest chroniona (np. /dashboard, /items/new, /items/:id/edit)
  const isEditRoute = /^\/items\/[^/]+\/edit(\/.*)?$/.test(pathname);
  const isProtected =
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) || isEditRoute;

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (!payload.userId) {
      throw new Error('Invalid payload');
    }
    return NextResponse.next();
  } catch {
    // Nieprawidłowy lub wygasły token - przekieruj do logowania
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/items/new',
    '/items/:path*/edit',
  ],
};
