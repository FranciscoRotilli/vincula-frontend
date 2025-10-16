import { NextRequest,NextResponse } from 'next/server';

import { apiFetchFormData } from '@/lib/backend';

export async function POST(req: NextRequest, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;

  const resp = await apiFetchFormData(`/case/${caseId}/files`, req, 'POST');

  return new NextResponse(resp.body, {
    status: resp.status,
    headers: resp.headers,
  });
}
