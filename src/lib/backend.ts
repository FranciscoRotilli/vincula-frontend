import { cookies } from 'next/headers';

import { tryRefreshAndGetAccess } from './auth-refresh';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function apiFetch(
  path: string,
  init?: RequestInit & { asJson?: boolean }
): Promise<Response> {
  const jar = await cookies();
  const access = jar.get('access_token')?.value;

  const doFetch = (token?: string) =>
    fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    });

  let resp = await doFetch(access);

  if (resp.status === 401) {
    const newAccess = await tryRefreshAndGetAccess();
    if (newAccess) resp = await doFetch(newAccess);
  }

  return resp;
}
