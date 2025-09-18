import { setAccessCookie, getTokensFromCookies } from './auth-cookies';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function tryRefreshAndGetAccess(): Promise<string | null> {
  const { refresh } = await getTokensFromCookies();
  if (!refresh) return null;

  const resp = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refresh }),
    cache: 'no-store',
  });

  if (!resp.ok) return null;

  const data: { access_token: string } = await resp.json();
  await setAccessCookie(data.access_token);
  return data.access_token;
}
