import { useMutation } from '@tanstack/react-query';

import { login } from '@/services/auth';
import { LoginResponse } from '@/types/User';

type LoginInput = {
  username: string;
  password: string;
};

export function useLogin() {
  return useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: ({ username, password }) => login(username, password),
    
  });
}
