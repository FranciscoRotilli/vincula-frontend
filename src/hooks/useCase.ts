import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addCase,
  allowUserToViewCase,
  CaseResponse,
  deleteCase,
  getCaseById,
  getCaseGraph,
  getCases,
  getUsersWithAccess,
  GraphFilters,
  removeUserAccess,
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
import { UserIdName } from '@/types/User';

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
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
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

export function useCaseById(caseId: string) {
  const queryResult = useQuery<CompleteCaseResponse, Error>({
    queryKey: ['case', caseId],
    queryFn: () => getCaseById(caseId),
    refetchOnWindowFocus: false,
  });

  localStorage.removeItem(`case`);

  if (queryResult.isSuccess) {
    localStorage.setItem(`case`, JSON.stringify(queryResult.data));
  }

  return queryResult;
}

export function useAllowVisualization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, userId }: { caseId: string; userId: string }) =>
      allowUserToViewCase(caseId, userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['caseUsers', variables.caseId] });
    },
  });
}

export function useCaseGraph(caseId: string, filters?: GraphFilters) {
  return useQuery({
    queryKey: [
      'caseGraph',
      caseId,
      filters?.investigated,
      filters?.identities,
      filters?.origin,
      filters?.archive,
    ],
    queryFn: () => getCaseGraph(caseId, filters),
    refetchOnWindowFocus: false,
    enabled: !!caseId,
  });
}

export function useUsersWithAccess(caseId: string) {
  return useQuery<UserIdName[], Error>({
    queryKey: ['caseUsers', caseId],
    queryFn: () => getUsersWithAccess(caseId),
    refetchOnWindowFocus: false,
    enabled: !!caseId,
  });
}

export function useRemoveUserAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, userId }: { caseId: string; userId: string }) =>
      removeUserAccess(caseId, userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['caseUsers', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
    },
  });
}
