import { useMutation } from '@tanstack/react-query';

import { addCase, CaseResponse } from '@/services/caseService';

type AddCaseInput = {
  name: string;
};

export function useCase() {
  return useMutation<CaseResponse, Error, AddCaseInput>({
    mutationFn: ({ name }) => addCase (name),
  });
}
