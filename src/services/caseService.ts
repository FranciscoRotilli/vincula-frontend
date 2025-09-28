/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import {
  ApiResponse,
  CasesResponse,
  CompleteCaseResponse,
  ApiSortingParams,
  FilterParams,
  PaginationParams,
} from '@/types/Cases';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
export async function getCaseById(caseId: string): Promise<CompleteCaseResponse> {
  const response = await axios.get(`${API_URL}/case/${caseId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  return response.data;
}

export async function updateCaseName(caseId: string, name: string) {
  const response = await axios.patch(
    `${API_URL}/case/${caseId}/`,
    { name },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    }
  );
  return response.data;
}

export async function updateCaseSituation(caseId: string, situation: string) {
  const response = await axios.patch(
    `${API_URL}/case/${caseId}/`,
    { situation },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    }
  );
  return response.data;
}

export async function updateCaseCanView(caseId: string, canView: boolean) {
  const response = await axios.patch(
    `${API_URL}/case/${caseId}/`,
    { canView },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    }
  );
  return response.data;
}

export async function deleteCase(caseId: string) {
  const response = await axios.delete(`${API_URL}/case/${caseId}/`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });
  return response.data;
}
