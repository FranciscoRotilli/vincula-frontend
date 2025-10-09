import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import {
  addCase,
  CaseResponse,
  deleteCase,
  getCaseById,
  getCases,
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
  return useMutation({
    mutationFn: ({ caseId, name }: { caseId: string; name: string }) =>
      updateCaseName(caseId, name),
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
  const router = useRouter();
  
  const queryResult = useQuery<CompleteCaseResponse, Error>({
    queryKey: ['case', caseId],
    queryFn: () => getCaseById(caseId),
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const status = isApiError(error) ? error.status : undefined;
      const message = isApiError(error) && typeof error.message === 'string' ? error.message : '';

      if (status === 403 || message.includes('permissão')) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error) => {
      const status = isApiError(error) ? error.status : undefined;
      const message = isApiError(error) && typeof error.message === 'string' ? error.message : '';

      if (status === 403 || message.includes('permissão')) {
        router.push('/casos');
      }
    },
  });

  return queryResult;
}
