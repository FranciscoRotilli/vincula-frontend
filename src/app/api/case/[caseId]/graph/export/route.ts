import { NextRequest } from 'next/server';

import { apiFetch } from '@/lib/backend';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;

  const search = _req.nextUrl.search;

  const resp = await apiFetch(`/case/${caseId}/graph/export${search}`, {
    method: 'GET',
    headers: { Accept: 'text/csv' },
  });

  if (!resp.ok || !resp.body) {
    const msg = await resp.text().catch(() => 'Erro ao exportar');
    return new Response(msg, { status: resp.status || 500 });
  }

  const headers = new Headers(resp.headers);
  headers.set('Content-Type', 'text/csv; charset=utf-8');
  headers.set('Content-Disposition', `attachment; filename="case-${caseId}-graph.csv"`);

  return new Response(resp.body, { status: 200, headers });
}
