import { useMutation } from '@tanstack/react-query';

import { addSuspect, deleteSuspect } from '@/services/suspectService';
import { SuspectInput } from '@/types/Cases';

export function useAddSuspect() {
  return useMutation({
    mutationFn: ({ caseId, newSuspect }: { caseId: string; newSuspect: SuspectInput }) =>
      addSuspect(caseId, newSuspect),
  });
}

export function useDeleteSuspect() {
  return useMutation({
    mutationFn: ({ caseId, suspectId }: { caseId: string; suspectId: string }) =>
      deleteSuspect(caseId, suspectId),
  });
}