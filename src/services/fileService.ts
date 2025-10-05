import { FileRequest } from '@/types/Files';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function removeFile(caseId: string, fileId: string) {
  const resp = await fetch(`${API_URL}/case/${caseId}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  if (!resp.ok) {
    throw new Error(`Falha ao remover arquivo: ${resp.statusText}`);
  }

  try {
    return await resp.json();
  } catch {
    return { ok: true };
  }
}

export async function addFile(fileId: string, newFile: FileRequest) {
  const resp = await fetch(`${API_URL}/case/${fileId}/files`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
    body: JSON.stringify(newFile),
  });

  if (!resp.ok) {
    throw new Error(`Falha ao adicionar arquivo: ${resp.statusText}`);
  }

  try {
    return await resp.json();
  } catch {
    return { ok: true };
  }
}
