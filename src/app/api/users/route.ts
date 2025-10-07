import { NextResponse } from 'next/server';

import { apiFetch } from '@/lib/backend';

export async function GET() {
  const resp = await apiFetch('/user/', {
    method: 'GET',
  });

  const text = await resp.text();

  if (!text) {
    return new NextResponse(null, { status: resp.status });
  }

  try {
    return NextResponse.json(JSON.parse(text), { status: resp.status });
  } catch {
    return new NextResponse(text, {
      status: resp.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
