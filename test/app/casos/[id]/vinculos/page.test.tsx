import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import VinculosPage from '@/app/casos/[id]/vinculos/page';

vi.mock('react', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    default: actual, 
    use: (thenable: any) => {
      if (thenable && typeof thenable.then === 'function') {
        return { id: '123' };
      }
      return thenable;
    },
  };
});

vi.mock('@/app/providers', () => ({
  Providers: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock('@/app/casos/[id]/vinculos/page.module.css', () => ({
  default: new Proxy({}, { get: () => 'cls' }),
}));

vi.mock('@/texts', () => ({
  t: (k: string) => k,
}));

vi.mock('@/components/CaseContainer', () => ({
  CaseContainer: ({ children, ...props }: React.PropsWithChildren<any>) => (
    <div data-testid="aba-container" {...props}>
      {children}
    </div>
  ),
}));

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

vi.mock('@/hooks/useCase', () => ({
  useCaseGraph: vi.fn((_id?: string, _filters?: any) => ({
    data: null,
    isLoading: false,
    error: null,
  })),
  useCaseById: vi.fn((_id?: string) => ({
    data: { suspects: [] },
    isLoading: false,
    error: null,
  })),
}));

vi.mock('@/components/Graph', () => ({
  __esModule: true,
  default: React.forwardRef<HTMLDivElement, any>(() => (
    <div data-testid="graph-mock" />
  )),
}));

vi.mock('@/components/GraphAlerts', () => ({
  GraphAlerts: ({ isLoading, hasError }: any) => (
    <div
      data-testid="graph-alerts-mock"
      data-loading={String(!!isLoading)}
      data-error={String(!!hasError)}
    />
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();

  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        suspects: [],
        archives: [],
        files: [],
      }),
    })
  );

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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('VinculosPage', () => {
  it('render page components correctly', async () => {
    const params = Promise.resolve({ id: 'qualquer-coisa' });

    render(<VinculosPage params={params} />);

    expect(await screen.findByTestId('graph-container')).toBeInTheDocument();
    expect(await screen.findByTestId('graph-controls')).toBeInTheDocument();
    expect(await screen.findByTestId('aba-container')).toBeInTheDocument();
    expect(await screen.findByTestId('graph-mock')).toBeInTheDocument();
    expect(await screen.findByTestId('filter-component')).toBeInTheDocument();
  });

  it('wraps content with CaseContainer', async () => {
    const params = Promise.resolve({ id: '123' });

    render(<VinculosPage params={params} />);

    const container = await screen.findByTestId('aba-container');
    expect(container).toBeInTheDocument();
    expect(within(container).getByTestId('filter-component')).toBeInTheDocument();
  });

  it('allows re-render with different params without throwing', async () => {
    const params1 = Promise.resolve({ id: '1' });
    const { unmount } = render(<VinculosPage params={params1} />);

    expect(await screen.findByTestId('filter-component')).toBeInTheDocument();
    unmount();

    const params2 = Promise.resolve({ id: '2' });
    render(<VinculosPage params={params2} />);

    expect(await screen.findByTestId('filter-component')).toBeInTheDocument();
    expect(await screen.findByTestId('graph-container')).toBeInTheDocument();
  });
});
