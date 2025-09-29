import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

import { getTokensFromCookies } from '@/lib/auth-cookies';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET() {
  const { access } = await getTokensFromCookies();
  if (!access) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(access, JWT_SECRET);
    return NextResponse.json({
      username: payload.username,
      role: payload.role,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
