import {
  ApiSortingParams,
  CasesResponse,
  CompleteCaseResponse,
  FilterParams,
  PaginationParams,
} from '@/types/Cases';
import { UserIdName } from '@/types/User';

export type CaseResponse = { caseName: string };

type ErrorWithMessage = { message: string };

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

async function throwIfError(resp: Response, fallback: string) {
  let err: unknown;
  try {
    err = await resp.json();
  } catch {
    /* noop */
  }
  const errorMessage = typeof err === 'object' && err && 'message' in (err as ErrorWithMessage)
    ? (err as ErrorWithMessage).message
    : `${fallback} (status ${resp.status})`;
  
  const error = new Error(errorMessage) as Error & { status?: number };
  error.status = resp.status;
  throw error;
}

export async function addCase(name: string): Promise<CaseResponse> {
  const resp = await fetch('/api/case', {
    method: 'POST',
    body: JSON.stringify({ name }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!resp.ok) await throwIfError(resp, 'Falha ao criar caso');
  return resp.json();
}

export async function getCases(
  paginationParams: PaginationParams,
  filterParams: FilterParams,
  sortingParams: ApiSortingParams
): Promise<CasesResponse> {
  const qs = toQueryString({ ...paginationParams, ...filterParams, ...sortingParams });
  const resp = await fetch(`/api/case${qs}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!resp.ok) await throwIfError(resp, 'Falha ao listar casos');
  return resp.json();
}

export async function getCaseById(caseId: string): Promise<CompleteCaseResponse> {
  const resp = await fetch(`/api/case/${caseId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!resp.ok) await throwIfError(resp, 'Falha ao buscar caso');
  return resp.json();
}

export async function updateCaseName(caseId: string, name: string) {
  const resp = await fetch(`/api/case/${caseId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!resp.ok) await throwIfError(resp, 'Falha ao atualizar nome do caso');
  try {
    const data = resp.json();
    return { data, name: resp.status };
  } catch {
    return { data: null, status: resp.status };
  }
}

export async function updateCaseSituation(caseId: string, status: string) {
  const resp = await fetch(`/api/case/${caseId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!resp.ok) await throwIfError(resp, 'Falha ao atualizar situação do caso');

  try {
    const data = await resp.json();
    return { data, status: resp.status };
  } catch {
    return { data: null, status: resp.status };
  }
}

export async function updateCaseCanView(caseId: string, canView: boolean) {
  const resp = await fetch(`/api/case/${caseId}`, {
    method: 'PATCH',
    body: JSON.stringify({ canView }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!resp.ok) await throwIfError(resp, 'Falha ao atualizar visibilidade do caso');
  return resp.json();
}

export async function deleteCase(caseId: string) {
  const resp = await fetch(`/api/case/${caseId}`, { method: 'DELETE' });
  if (!resp.ok) await throwIfError(resp, 'Falha ao excluir caso');

  try {
    return await resp.json();
  } catch {
    return { ok: true };
  }
}

export async function allowUserToViewCase(caseId: string, userId: string) {
  if (!caseId || !userId) return null;
  const resp = await fetch(`/api/case/addtocase/${caseId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });

  if (resp.status === 204) {
    return null;
  }

  return resp.json();
}

export interface GraphFilters {
  investigated?: string;
  cpf_cnpj?: string;
  origin?: string;
  archive?: string;
}

export async function getCaseGraph(caseId: string, filters?: GraphFilters) {
  const params = new URLSearchParams();

  if (filters?.investigated) {
    params.append('investigated', filters.investigated);
  }

  if (filters?.cpf_cnpj) {
    params.append('cpf_cnpj', filters.cpf_cnpj);
  }

  if (filters?.origin) {
    params.append('origin', filters.origin);
  }

  if (filters?.archive) {
    params.append('archive', filters.archive);
  }

  const qs = params.toString();
  const url = `/api/case/${caseId}/graph${qs ? `?${qs}` : ''}`;
  
  const resp = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!resp.ok) await throwIfError(resp, 'Falha ao buscar dados do grafo');
  return resp.json();
}

export async function updateCaseOwner(caseId: string, userId: string): Promise<void> {
  const resp = await fetch(`/api/cases/${caseId}/owner`, {
    method: 'PATCH',
    body: JSON.stringify({ user_id: userId }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!resp.ok) await throwIfError(resp, 'Falha ao atualizar responsável do caso');
}

export async function getUsersWithAccess(caseId: string): Promise<UserIdName[]> {
  const resp = await fetch(`/api/cases/${caseId}/users`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!resp.ok) await throwIfError(resp, 'Falha ao buscar usuários com acesso');
  return resp.json();
}

export async function removeUserAccess(caseId: string, userId: string): Promise<void> {
  const resp = await fetch(`/api/cases/${caseId}/users/${userId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!resp.ok) await throwIfError(resp, 'Falha ao remover acesso do usuário');
}
