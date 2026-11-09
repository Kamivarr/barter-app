import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const SESSION_COOKIE_NAME = 'barter_session';
export const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 dni

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  neighborhood: string | null;
  exactAddress: string | null;
  phone: string | null;
  city: string;
  avatarUrl: string | null;
  createdAt: Date;
}

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ||
    'barter_jwt_secret_development_key_min_32_bytes_super_secure_2026!';
  return new TextEncoder().encode(secret);
}

/**
 * Podpisuje nowy token sesyjny JWT za pomocą klucza JWT_SECRET (HS256).
 */
export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getJwtSecret());
}

/**
 * Weryfikuje podpis i ważność tokenu JWT. Zwraca payload lub null w przypadku niepowodzenia.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (!payload.userId || typeof payload.userId !== 'string') {
      return null;
    }
    return {
      userId: payload.userId as string,
      email: (payload.email as string) || '',
      name: (payload.name as string) || '',
    };
  } catch {
    return null;
  }
}

/**
 * Zapisuje ciasteczko sesyjne HttpOnly z tokenem JWT.
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_SECONDS,
    path: '/',
  });
}

/**
 * Usuwa ciasteczko sesyjne przy wylogowaniu.
 */
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Odczytuje sesję z ciasteczka i pobiera dane aktualnego użytkownika z bazy SQLite.
 * Zwraca null gdy brak aktywnej sesji lub token jest nieprawidłowy.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        neighborhood: true,
        exactAddress: true,
        phone: true,
        city: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Błąd podczas odczytu sesji użytkownika:', error);
    return null;
  }
}

/**
 * Wymusza zalogowanie użytkownika w Server Actions lub Server Components.
 * Rzuca wyjątek UNAUTHORIZED gdy brak sesji.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}
