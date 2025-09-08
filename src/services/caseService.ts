import axios from 'axios';

import { ApiResponse, FilterParams, FilterSchema, PaginationParams, PaginationSchema } from '@/types/Cases';


const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type CaseResponse = {
    caseName: string
}

export async function addCase(name: string): Promise<any> {
    const response = await axios.post(`${API_URL}/case/`, {
    name,
  }, 
  {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem('access_token')}`, // header igual ao Swagger
  }},
  );
  return response.data;
};

export async function getCases(
  paginationParams: PaginationParams,
  filterParams: FilterParams
): Promise<ApiResponse> {
  const validatedPaginationParams = PaginationSchema.parse(paginationParams)
  const validatedFilterParams = FilterSchema.parse(filterParams)
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
    params: {
      ...validatedPaginationParams,
      ...validatedFilterParams
    }
  }
  const response = await axios.get(`${API_URL}/case/`, config)

  return response.data;
}