import { NextRequest, NextResponse } from 'next/server';

import { apiFetch } from '@/lib/backend';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const payload = await req.json();
    const { caseId } = await params;

    const resp = await apiFetch(`/case/${caseId}/suspect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const ct = resp.headers.get('content-type') ?? '';
    const text = await resp.text();

    if (ct.includes('application/json') && text) {
      return NextResponse.json(JSON.parse(text), { status: resp.status });
    }

    return new NextResponse(text || null, {
      status: resp.status,
      headers: { 'Content-Type': ct || 'text/plain' },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Falha ao adicionar suspeito', details: String(err) },
      { status: 500 }
    );
  }
}
