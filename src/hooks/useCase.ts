import { useMutation, useQuery } from '@tanstack/react-query';

import { addCase, CaseResponse, getCases } from '@/services/caseService';
import { ApiResponse, ApiSortingParams, FilterParams, PaginationParams } from '@/types/Cases';

type AddCaseInput = {
  name: string;
};

export function useCase() {
  return useMutation<CaseResponse, Error, AddCaseInput>({
    mutationFn: ({ name }) => addCase(name),
  });
}

export function useCases(
  pagination: PaginationParams,
  filters: FilterParams,
  sorting: ApiSortingParams
) {
  return useQuery<ApiResponse, Error>({
    queryKey: ['cases', pagination, filters, sorting],
    queryFn: () => getCases(pagination, filters, sorting),
  });
}
