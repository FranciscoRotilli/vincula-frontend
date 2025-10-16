// src/lib/auth-cookies.ts
import { cookies } from 'next/headers';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

const baseShort = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/',
};
const baseLong = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  path: '/',
};

export async function setAccessCookie(token: string, expSeconds?: number) {
  const jar = await cookies();
  const expires = expSeconds ? new Date(expSeconds * 1000) : undefined;
  jar.set(ACCESS_COOKIE, token, { ...baseShort, expires });
}

export async function setRefreshCookie(token: string, expSeconds?: number) {
  const jar = await cookies();
  const expires = expSeconds ? new Date(expSeconds * 1000) : undefined;
  jar.set(REFRESH_COOKIE, token, { ...baseLong, expires });
}

export async function getTokensFromCookies() {
  const jar = await cookies();
  return {
    access: jar.get(ACCESS_COOKIE)?.value,
    refresh: jar.get(REFRESH_COOKIE)?.value,
  };
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}
