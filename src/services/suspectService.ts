import { SuspectRequest } from '@/types/Cases';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function addSuspect(caseId: string, suspect: SuspectRequest) {
  const resp = await fetch(`${API_URL}/case/${caseId}/suspect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
    body: JSON.stringify(suspect),
  });

  if (!resp.ok) {
    throw new Error(`Falha ao adicionar suspeito: ${resp.statusText}`);
  }

  try {
    return await resp.json();
  } catch {
    return { ok: true };
  }
}
