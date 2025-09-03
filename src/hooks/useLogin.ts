import { useMutation } from '@tanstack/react-query';
import { login, LoginResponse } from '@/services/auth';

type LoginInput = {
  username: string;
  password: string;
};

export function useLogin() {
  return useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: ({ username, password }) => login(username, password),
    
  });
}
