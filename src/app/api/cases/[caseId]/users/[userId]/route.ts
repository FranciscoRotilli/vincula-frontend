import { NextRequest, NextResponse } from 'next/server';

import { apiFetch } from '@/lib/backend';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string; userId: string }> }
) {
  const { caseId, userId } = await params;
  
  const resp = await apiFetch(`/cases/${caseId}/users/${userId}`, {
    method: 'DELETE',
  });
  
  if (!resp.ok) {
    return NextResponse.json(
      { message: 'Falha ao remover acesso do usuário' },
      { status: resp.status }
    );
  }
  
  return NextResponse.json({ success: true });
}
