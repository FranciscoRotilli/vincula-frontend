import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import {
  addCase,
  allowUserToViewCase,
  CaseResponse,
  deleteCase,
  getCaseById,
  getCaseGraph,
  getCases,
  GraphFilters,
  updateCaseCanView,
  updateCaseName,
  updateCaseOwner,
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (caseId: string) => deleteCase(caseId),
    onSuccess: (_data, caseId) => { 
      queryClient.invalidateQueries({ queryKey: ['cases'] }); 
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
    },
  });
}

export function useUpdateCaseOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, userId }: { caseId: string; userId: string }) =>
      updateCaseOwner(caseId, userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
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

type ApiError = { status?: number; message?: string };

function isApiError(err: unknown): err is ApiError {
  return typeof err === 'object' && err !== null && ('status' in err || 'message' in err);
}

export function useCaseById(caseId: string) {
  const queryResult = useQuery<CompleteCaseResponse, Error>({
    queryKey: ['case', caseId],
    queryFn: () => getCaseById(caseId),
    refetchOnWindowFocus: false,
  });

  return queryResult;

}

export function useAllowVisualization() {
    return useMutation({
        mutationFn: ({ caseId, userId }: { caseId: string; userId: string}) =>
            allowUserToViewCase(caseId, userId),
    });
}

export function useCaseGraph(caseId: string, filters?: GraphFilters) {
  return useQuery({
    queryKey: [
      'caseGraph', 
      caseId, 
      filters?.investigated,
      filters?.cpf_cnpj,
      filters?.origin,
      filters?.archive,
    ],
    queryFn: () => getCaseGraph(caseId, filters),
    refetchOnWindowFocus: false,
    enabled: !!caseId,
  });
}
