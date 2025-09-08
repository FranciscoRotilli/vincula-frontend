import { useMutation, useQuery } from '@tanstack/react-query';
import { addCase, getCases, CaseResponse } from '@/services/caseService';
import { ApiResponse, FilterParams, PaginationParams } from '@/types/Cases';

type AddCaseInput = {
  name: string;
};

export function useCase() {
  return useMutation<CaseResponse, Error, AddCaseInput>({
    mutationFn: ({ name }) => addCase (name),
  });
}

export function useCases(pagination: PaginationParams, filters: FilterParams) {
  return useQuery<ApiResponse, Error>({
    queryKey: ['cases', pagination, filters],
    queryFn: () => getCases(pagination, filters),
  })
}