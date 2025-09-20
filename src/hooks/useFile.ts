import { useMutation, useQueryClient } from '@tanstack/react-query';

import { removeFile } from '@/services/fileService';

export function useRemoveFile(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => removeFile(caseId, fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
    },
  });
}
