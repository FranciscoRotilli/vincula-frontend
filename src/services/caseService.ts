/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

import { CasesResponse, ApiSortingParams, FilterParams, PaginationParams, CompleteCaseResponse } from '@/types/Cases';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type CaseResponse = {
  caseName: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function addCase(name: string): Promise<any> {
  const response = await axios.post(
    `${API_URL}/case/`,
    {
      name,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`, // header igual ao Swagger
      },
    }
  );
  return response.data;
}

export async function getCases(
  paginationParams: PaginationParams,
  filterParams: FilterParams,
  sortingParams: ApiSortingParams
): Promise<CasesResponse> {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
    params: {
      ...paginationParams,
      ...filterParams,
      ...sortingParams,
    },
  };
  const response = await axios.get(`${API_URL}/case/`, config);

  return response.data;
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
