import { FileFilterParams, FileRequest } from '@/types/Files';

function toQueryString(params: Record<string, unknown>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) v.forEach((item) => search.append(k, String(item)));
    else search.set(k, String(v));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

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

export async function getFileDataById(
  caseId: string,
  fileId: string,
  filterParams: FileFilterParams
) {
  const qs = toQueryString({ ...filterParams });
  const resp = await fetch(`/api/case/${caseId}/files/${fileId}${qs}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  if (!resp.ok) {
    throw new Error(`Falha ao consultar dados do arquivo: ${resp.statusText}`);
  }

  try {
    return await resp.json();
  } catch {
    return { ok: true };
  }
}
