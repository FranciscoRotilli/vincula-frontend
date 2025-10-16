import { FileRequest } from '@/types/Files';

export async function removeFile(caseId: string, fileId: string) {
  const resp = await fetch(`/api/case/${caseId}/files/${fileId}`, {
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

export async function addFile(caseId: string, newFile: FileRequest) {
  const formData = new FormData();
  formData.append('origin', newFile.origin);
  formData.append('file_type', newFile.file_type);
  formData.append('file', newFile.file);

  const resp = await fetch(`/api/case/${caseId}/files`, {
    method: 'POST',
    body: formData,
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
