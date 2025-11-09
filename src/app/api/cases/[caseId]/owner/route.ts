import { NextRequest, NextResponse } from 'next/server';

import { apiFetch } from '@/lib/backend';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const body = await req.json();

  const resp = await apiFetch(`/case/${caseId}/owner`, {
    method: 'PATCH',
    body: JSON.stringify(body),
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


