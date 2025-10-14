/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApiSortingParams,
  CasesResponse,
  CompleteCaseResponse,
  FilterParams,
  PaginationParams,
} from '@/types/Cases';

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
  throw new Error(
    typeof err === 'object' && err && 'message' in (err as ErrorWithMessage)
      ? (err as ErrorWithMessage).message
      : `${fallback} (status ${resp.status})`
  );
}

export async function addCase(name: string): Promise<CaseResponse> {
  const resp = await fetch('/api/cases', {
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
  const resp = await fetch(`/api/cases${qs}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!resp.ok) await throwIfError(resp, 'Falha ao listar casos');
  return resp.json();
}

export async function getCaseById(caseId: string): Promise<CompleteCaseResponse> {
  const resp = await fetch(`/api/cases/${caseId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!resp.ok) await throwIfError(resp, 'Falha ao buscar caso');
  return resp.json();
}

export async function updateCaseName(caseId: string, name: string) {
  const resp = await fetch(`/api/cases/${caseId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!resp.ok) await throwIfError(resp, 'Falha ao atualizar nome do caso');
  return resp.json();
}

export async function updateCaseSituation(caseId: string, status: string) {
  const resp = await fetch(`/api/cases/${caseId}`, {
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
  const resp = await fetch(`/api/cases/${caseId}`, {
    method: 'PATCH',
    body: JSON.stringify({ canView }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!resp.ok) await throwIfError(resp, 'Falha ao atualizar visibilidade do caso');
  return resp.json();
}

export async function deleteCase(caseId: string) {
  const resp = await fetch(`${caseId}`, { method: 'DELETE' });
  if (!resp.ok) await throwIfError(resp, 'Falha ao excluir caso');

  try {
    return await resp.json();
  } catch {
    return { ok: true };
  }
}
