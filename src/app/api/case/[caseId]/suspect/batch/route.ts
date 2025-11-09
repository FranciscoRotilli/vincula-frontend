import { NextRequest, NextResponse } from 'next/server';

import { apiFetchFormData } from '@/lib/backend';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;

    const response = await apiFetchFormData(`/case/${caseId}/investigadoslote`, request, 'POST');

    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Erro ao processar adição de investigados em lote:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
