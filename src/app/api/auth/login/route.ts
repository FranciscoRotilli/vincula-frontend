import { NextResponse } from 'next/server';

import { setAccessCookie, setRefreshCookie } from '@/lib/auth-cookies';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function POST(req: Request) {
  const body = await req.json();

  const resp = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    return NextResponse.json(err, { status: resp.status });
  }

  const data: {
    user: string;
    role: string;
    access_token: string;
    refresh_token: string;
  } = await resp.json();

  await setAccessCookie(data.access_token);
  await setRefreshCookie(data.refresh_token);

  return NextResponse.json({ user: data.user, role: data.role });
}
