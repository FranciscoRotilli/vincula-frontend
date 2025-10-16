import '@testing-library/jest-dom/vitest';

import { afterEach,beforeEach, vi } from 'vitest';

export const mockRouter = { push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() };
vi.mock('next/navigation', () => ({ __esModule: true, useRouter: () => mockRouter }));

// Mock do fetch global mais robusto
const fetchMock = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        username: 'testuser',
        role: 'admin',
      }),
    text: () => Promise.resolve(''),
  })
) as any;

global.fetch = fetchMock;

// Configurar mocks antes de cada teste
beforeEach(() => {
  // Reset dos mocks
  vi.clearAllMocks();
  fetchMock.mockClear();
});

// Cleanup após cada teste
afterEach(() => {
  vi.clearAllMocks();
});

// Mock de window.location para evitar erros de navegação em testes
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});

// Mock dos serviços de auth
vi.mock('@/services/auth', () => ({
  getCurrentUser: vi.fn(() =>
    Promise.resolve({
      username: 'testuser',
      role: 'admin',
    })
  ),
  login: vi.fn((username: string, password: string) => {
    if (username === 'erro' && password === 'qualquer') {
      return Promise.reject(new Error('Credenciais inválidas'));
    }
    return Promise.resolve({
      user: 'testuser',
      role: 'admin',
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
    });
  }),
  logout: vi.fn(() => Promise.resolve()),
}));

// Mock dos serviços de cases
vi.mock('@/services/caseService', () => ({
  getCases: vi.fn(() =>
    Promise.resolve({
      data: [],
      page: 1,
      totalPages: 1,
      totalCount: 0,
    })
  ),
  addCase: vi.fn(() =>
    Promise.resolve({
      caseName: 'Test Case',
    })
  ),
}));
