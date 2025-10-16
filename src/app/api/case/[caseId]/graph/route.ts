import { NextRequest, NextResponse } from 'next/server';

import { apiFetch } from '@/lib/backend';

export async function GET(req: NextRequest, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const qs = req.nextUrl.search;
  
  const resp = await apiFetch(`/case/${caseId}/graph${qs}`, { method: 'GET' });

  const text = await resp.text();
  try {
    const json = JSON.parse(text);
    return NextResponse.json(json, { status: resp.status });
  } catch {
    return new NextResponse(text, {
      status: resp.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}