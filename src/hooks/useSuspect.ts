import { useMutation } from '@tanstack/react-query';

import { addSuspect } from '@/services/suspectService';
import { SuspectRequest } from '@/types/Cases';

export function useAddSuspect() {
  return useMutation({
    mutationFn: ({ caseId, newSuspect }: { caseId: string; newSuspect: SuspectRequest }) =>
      addSuspect(caseId, newSuspect),
  });
}
