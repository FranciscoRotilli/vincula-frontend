import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

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

export async function apiFetchFormData(
  path: string,
  req: NextRequest,
  method: 'POST' | 'PUT' = 'POST'
): Promise<Response> {
  const jar = await cookies();
  const access = jar.get('access_token')?.value;

  const doFetch = (token?: string) => {
    const initWithDuplex: RequestInit & { duplex?: 'half' } = {
      method,
      headers: {
        'Content-Type': req.headers.get('content-type') || '',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: req.body,
      cache: 'no-store',
      duplex: 'half',
    };

    return fetch(`${API_URL}${path}`, initWithDuplex as RequestInit);
  };

  let resp = await doFetch(access);

  if (resp.status === 401) {
    const newAccess = await tryRefreshAndGetAccess();
    if (newAccess) resp = await doFetch(newAccess);
  }

  return resp;
}
