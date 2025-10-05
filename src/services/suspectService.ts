import { SuspectInput } from '@/types/Cases';


export async function addSuspect(caseId: string, suspect: SuspectInput) {
  const resp = await fetch(`/api/case/${caseId}/suspect`, {
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

export async function deleteSuspect(caseId: string, suspectId: string) {
  const response = await fetch(`/api/case/${caseId}/suspect/${suspectId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Falha ao remover suspeito: ${response.statusText}`);
  }
}
