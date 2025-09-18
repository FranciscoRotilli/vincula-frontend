import { NextResponse } from 'next/server';
import { tryRefreshAndGetAccess } from '@/lib/auth-refresh';

export async function POST() {
  const newToken = await tryRefreshAndGetAccess();
  if (!newToken) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true });
}
