import { useQuery } from '@tanstack/react-query';

export interface User {
  id: string;
  name: string;
}

async function getUsers(): Promise<User[]> {
  const resp = await fetch('/api/users', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!resp.ok) {
    throw new Error(`Falha ao buscar usuários (status ${resp.status})`);
  }
  return resp.json();
}

export function useUsers() {
  return useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 5 * 60 * 1000, 
  });
}
