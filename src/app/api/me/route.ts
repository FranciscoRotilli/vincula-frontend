import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

import { getTokensFromCookies } from '@/lib/auth-cookies';
import { tryRefreshAndGetAccess } from '@/lib/auth-refresh';

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
    const newAccessToken = await tryRefreshAndGetAccess();

    if (newAccessToken) {
      try {
        const { payload } = await jwtVerify(newAccessToken, JWT_SECRET);
          return NextResponse.json({
            username: payload.username,
            role: payload.role,
          });
      } catch {
        return NextResponse.json({ error: 'Failed to process new token' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
