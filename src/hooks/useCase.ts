import { useMutation, useQuery } from '@tanstack/react-query';

import { useMockData } from '@/app/casos/teste/page';
import { addCase, CaseResponse, deleteCase, getCaseById, getCases, updateCaseCanView, updateCaseName, updateCaseSituation } from '@/services/caseService';
import { ApiSortingParams, CaseItem, CasesResponse, CompleteCaseResponse, FilterParams, PaginationParams } from '@/types/Cases';

type AddCaseInput = {
  name: string;
};

export function useCase() {
  return useMutation<CaseResponse, Error, AddCaseInput>({
    mutationFn: ({ name }) => addCase(name),
  });
}

export function useUpdateCaseName() {
  return useMutation({
    mutationFn: (
      { caseId, name }: { caseId: string; name: string }
    ) => updateCaseName(caseId, name),
  });
}

export function useUpdateCaseSituation() {
  return useMutation({
    mutationFn: ({ caseId, situation }: { caseId: string; situation: CaseItem['status'] }) =>
      updateCaseSituation(caseId, situation),
  });
}

export function useUpdateCaseCanView() {
  return useMutation({
    mutationFn: ({ caseId, canView }: { caseId: string; canView: boolean }) =>
      updateCaseCanView(caseId, canView),
  });
}

export function useDeleteCase() {
  return useMutation({
    mutationFn: (caseId: string) => deleteCase(caseId),
  });
}

export function useCases(
  pagination: PaginationParams,
  filters: FilterParams,
  sorting: ApiSortingParams
) {
  return useQuery<CasesResponse, Error>({
    queryKey: ['cases', pagination, filters, sorting],
    queryFn: () => getCases(pagination, filters, sorting),
  });
}

export function useCaseById(caseId: string) {
  const mock = useMockData?.();

  const queryResult = useQuery<CompleteCaseResponse, Error>({
    queryKey: ['case', caseId],
    queryFn: () => getCaseById(caseId),
    refetchOnWindowFocus: false,
    enabled: !mock?.caseDetails,
  });

  if (mock?.caseDetails) {
    return { data: mock.caseDetails, isLoading: false, isError: false };
  }

  return queryResult;
}
