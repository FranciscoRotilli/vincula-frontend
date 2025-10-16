import { LoginResponse } from '@/types/User';

export async function login(username: string, password: string): Promise<LoginResponse> {
  const resp = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if (!resp.ok) throw new Error('Credenciais inválidas');
  return resp.json();
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
}

export async function getCurrentUser() {
  const resp = await fetch('/api/me');
  if (!resp.ok) {
    if (resp.status === 401) {
      throw new Error('Failed to get user');
    }
    return null;
  }
  return resp.json();
}
