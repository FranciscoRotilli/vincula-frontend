import { NextRequest, NextResponse } from 'next/server';

import { apiFetch } from '@/lib/backend';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ caseId: string; fileId: string }> }
) {
  const { caseId, fileId } = await params;

  try {
    const resp = await apiFetch(`/case/${caseId}/files/${fileId}`, {
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string; fileId: string }> }
) {
  const qs = req.nextUrl.search;
  const { caseId, fileId } = await params;

  const resp = await apiFetch(`/case/${caseId}/files/${fileId}${qs}`, { method: 'GET' });

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
