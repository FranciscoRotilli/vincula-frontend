import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import VinculosPage from '@/app/casos/[id]/vinculos/page';
import Providers from '@/app/providers';

// Mock do CaseContainer
vi.mock('@/components/CaseContainer', () => ({
  CaseContainer: ({ children, ...props }: React.PropsWithChildren<any>) => (
    <div data-testid="aba-container" {...props}>
      {children}
    </div>
  ),
}));

// Mock do componente Filter
vi.mock('@/components/Filter', () => ({
  __esModule: true,
  default: ({ onFilter, onClear, ...props }: any) => (
    <div data-testid="filter-component" {...props}>
      <button onClick={() => onFilter && onFilter({})}>Filter</button>
      <button onClick={() => onClear && onClear()}>Clear</button>
    </div>
  ),
  FieldConfig: {},
  FilterValues: {},
}));

// Mock do hook useCaseGraph
vi.mock('@/hooks/useCase', () => ({
  useCaseGraph: vi.fn(() => ({ 
    data: null, 
    isLoading: false, 
    error: null 
  })),
}));

// Mock do componente Graph
vi.mock('@/components/Graph', () => ({
  __esModule: true,
  default: React.forwardRef<HTMLDivElement, any>(() => 
    <div data-testid="graph-mock" />
  ),
}));

// Mock do componente GraphAlerts
vi.mock('@/components/GraphAlerts', () => ({
  GraphAlerts: () => <div data-testid="graph-alerts-mock" />,
}));

// Mock do React hook 'use'
vi.mock('react', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    use: (thenable: any) => {
      if (thenable && typeof thenable.then === 'function') {
        return { id: '123' };
      }
      return thenable;
    },
  };
});

beforeEach(() => {
  vi.resetAllMocks();
  
  // Mock da API de caso
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ 
        suspects: [],
        files: []
      }),
    })
  );

  // Mock das funções de fullscreen API
  Object.defineProperty(document, 'fullscreenElement', {
    value: null,
    writable: true,
  });
  
  Object.defineProperty(document.documentElement, 'requestFullscreen', {
    value: vi.fn(),
    writable: true,
  });
  
  Object.defineProperty(document, 'exitFullscreen', {
    value: vi.fn(),
    writable: true,
  });
});

describe('VinculosPage', () => {
  it('render page components correctly', async () => {
    const params = Promise.resolve({ id: 'qualquer-coisa' });

    render(
      <Providers>
        <VinculosPage params={params} />
      </Providers>
    );

    // Aguarda elementos serem renderizados
    expect(await screen.findByTestId('graph-container')).toBeInTheDocument();
    expect(await screen.findByTestId('graph-controls')).toBeInTheDocument();
    expect(await screen.findByTestId('aba-container')).toBeInTheDocument();
    expect(await screen.findByTestId('graph-mock')).toBeInTheDocument();
    expect(await screen.findByTestId('filter-component')).toBeInTheDocument();
  });

  it('wraps content with CaseContainer', async () => {
    const params = Promise.resolve({ id: '123' });
    render(
      <Providers>
        <VinculosPage params={params} />
      </Providers>
    );

    const container = await screen.findByTestId('aba-container');
    expect(container).toBeInTheDocument();
    
    // Verifica se o filtro está dentro do container
    expect(within(container).getByTestId('filter-component')).toBeInTheDocument();
  });

  it('allows re-render with different params without throwing', async () => {
    const params1 = Promise.resolve({ id: '1' });
    const { unmount } = render(
      <Providers>
        <VinculosPage params={params1} />
      </Providers>
    );

    expect(await screen.findByTestId('filter-component')).toBeInTheDocument();

    unmount();

    const params2 = Promise.resolve({ id: '2' });
    render(
      <Providers>
        <VinculosPage params={params2} />
      </Providers>
    );

    expect(await screen.findByTestId('filter-component')).toBeInTheDocument();
    expect(await screen.findByTestId('graph-container')).toBeInTheDocument();
  });
});
