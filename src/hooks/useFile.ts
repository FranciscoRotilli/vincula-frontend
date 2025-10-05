import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addFile, removeFile } from '@/services/fileService';
import { FileRequest } from '@/types/Files';

export function useRemoveFile(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => removeFile(caseId, fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
    },
  });
}

export function useAddFile() {
  return useMutation({
    mutationFn: ({ fileId, newFile }: { fileId: string; newFile: FileRequest }) =>
      addFile(fileId, newFile),
  });
}
