import { NextRequest, NextResponse } from 'next/server';

import { apiFetch } from '@/lib/backend';

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.search;
  const resp = await apiFetch(`/case/${qs}`, { method: 'GET' });

  const text = await resp.text();
  try {
    return NextResponse.json(JSON.parse(text), { status: resp.status });
  } catch {
    return new NextResponse(text, {
      status: resp.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const resp = await apiFetch(`/case/`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const text = await resp.text();
  try {
    return NextResponse.json(JSON.parse(text), { status: resp.status });
  } catch {
    return new NextResponse(text, {
      status: resp.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
