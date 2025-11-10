import { NextRequest, NextResponse } from 'next/server';

import { apiFetch } from '@/lib/backend';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;
  
  const resp = await apiFetch(`/cases/${caseId}/users`);
  
  if (!resp.ok) {
    return NextResponse.json(
      { message: 'Falha ao buscar usuários com acesso' },
      { status: resp.status }
    );
  }
  
  const data = await resp.json();
  return NextResponse.json(data);
}
