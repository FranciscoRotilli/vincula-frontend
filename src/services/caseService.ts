import { ApiResponse, ApiSortingParams, FilterParams, PaginationParams } from '@/types/Cases';

export type CaseResponse = {
  caseName: string;
};

type ErrorWithMessage = {
  message: string;
};

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

export async function addCase(name: string): Promise<CaseResponse> {
  const resp = await fetch('/api/cases', {
    method: 'POST',
    body: JSON.stringify({ name }),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!resp.ok) {
    let err: unknown;
    try {
      err = await resp.json();
    } catch {
      /* noop */
    }
    throw new Error(
      typeof err === 'object' && err && 'message' in (err as ErrorWithMessage)
        ? (err as ErrorWithMessage).message
        : `Falha ao criar caso (status ${resp.status})`
    );
  }

  return resp.json();
}

export async function getCases(
  paginationParams: PaginationParams,
  filterParams: FilterParams,
  sortingParams: ApiSortingParams
): Promise<ApiResponse> {
  const qs = toQueryString({ ...paginationParams, ...filterParams, ...sortingParams });

  const resp = await fetch(`/api/cases${qs}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!resp.ok) {
    let err: unknown;
    try {
      err = await resp.json();
    } catch {
      /* noop */
    }
    throw new Error(
      typeof err === 'object' && err && 'message' in (err as ErrorWithMessage)
        ? (err as ErrorWithMessage).message
        : `Falha ao listar casos (status ${resp.status})`
    );
  }

  return resp.json();
}
