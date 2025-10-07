import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addCase,
  CaseResponse,
  deleteCase,
  getCaseById,
  getCaseGraph,
  getCases,
  updateCaseCanView,
  updateCaseName,
  updateCaseSituation,
} from '@/services/caseService';
import {
  ApiSortingParams,
  CaseItem,
  CasesResponse,
  CompleteCaseResponse,
  FilterParams,
  PaginationParams,
} from '@/types/Cases';

type AddCaseInput = {
  name: string;
};

export function useCase() {
  return useMutation<CaseResponse, Error, AddCaseInput>({
    mutationFn: ({ name }) => addCase(name),
  });
}

export function useUpdateCaseName() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, name }: { caseId: string; name: string }) =>
      updateCaseName(caseId, name),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({queryKey: ['case', variables.caseId]});
      queryClient.invalidateQueries({queryKey: ['cases']});
    }
  });
}

export function useUpdateCaseSituation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, situation }: { caseId: string; situation: CaseItem['status'] }) =>
      updateCaseSituation(caseId, situation),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
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
  const queryResult = useQuery<CompleteCaseResponse, Error>({
    queryKey: ['case', caseId],
    queryFn: () => getCaseById(caseId),
    refetchOnWindowFocus: false,
  });

  return queryResult;
}

export function useCaseGraph(caseId: string, identities?: string[]) {
  return useQuery({
    queryKey: ['caseGraph', caseId, identities],
    queryFn: () => getCaseGraph(caseId, identities),
    refetchOnWindowFocus: false,
    enabled: !!caseId,
  });
}
