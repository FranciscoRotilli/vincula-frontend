// src/app/[caseId]/suspect/[suspectId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { apiFetch } from '@/lib/backend';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ caseId: string; suspectId: string }> }
) {
  const { caseId, suspectId } = await params;

  try {
    const resp = await apiFetch(`/case/${caseId}/suspect/${suspectId}`, {
      method: 'DELETE',
    });

    const text = await resp.text();
    const ct = resp.headers.get('content-type') ?? '';

    if (ct.includes('application/json') && text) {
      return NextResponse.json(JSON.parse(text), { status: resp.status });
    }
    
    return new NextResponse(text || null, {
      status: resp.status,
      headers: { 'Content-Type': ct || 'text/plain' },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to delete suspect', details: String(err) },
      { status: 500 }
    );
  }
}
