import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateCaseOwner } from '@/services/caseService';

export function useUpdateCaseOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, owner }: { caseId: string; owner: string }) =>
      updateCaseOwner(caseId, owner),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}
