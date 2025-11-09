import { SuspectRequest } from '@/types/Cases';


export async function addSuspect(caseId: string, suspect: SuspectRequest) {
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

export async function addSuspectsBatch(caseId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/case/${caseId}/suspect/batch`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Falha ao adicionar suspeitos em lote: ${response.statusText}`);
  }

  try {
    return await response.json();
  } catch {
    return { ok: true };
  }
}
