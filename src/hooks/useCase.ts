import { useMutation, useQuery } from '@tanstack/react-query';

import { addCase, CaseResponse, getCaseById, getCases } from '@/services/caseService';
import { CasesResponse, ApiSortingParams, FilterParams, PaginationParams, CompleteCaseResponse } from '@/types/Cases';

type AddCaseInput = {
  name: string;
};

export function useCase() {
  return useMutation<CaseResponse, Error, AddCaseInput>({
    mutationFn: ({ name }) => addCase(name),
  });
}

export function useCases(pagination: PaginationParams, filters: FilterParams, sorting: ApiSortingParams) {
  return useQuery<CasesResponse, Error>({
    queryKey: ['cases', pagination, filters, sorting],
    queryFn: () => getCases(pagination, filters, sorting),
  });
}

export function useCaseById(caseId: string) {
  return useQuery<CompleteCaseResponse, Error>({
    queryKey: ['case', caseId],
    queryFn: () => getCaseById(caseId),
  });
}
