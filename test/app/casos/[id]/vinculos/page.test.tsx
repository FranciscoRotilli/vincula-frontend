import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { beforeEach,describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import VinculosPage from '../../../../../src/app/casos/[id]/vinculos/page';
import GeneralInfoPage from '../../../../../src/app/casos/[id]/page';

vi.mock('@/components/CaseContainer', () => ({
  CaseContainer: ({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) => (
    <div data-testid="aba-container" {...props}>{children}</div>
  ),
}));

const mutateMock = vi.fn((args, opts) => opts?.onSuccess && opts.onSuccess());
vi.mock('@/hooks/useCase', () => ({
  useCaseById: (_id: string) => ({
    data: {
      name: 'Caso teste',
      suspects: [],
      archives: [],
      owner: 'Responsável atual',
      creation_date: '2025-01-01',
      status: 'Em andamento',
      case_number: '1',
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useDeleteCase: () => ({ mutate: vi.fn() }),
  useUpdateCaseCanView: () => ({ mutate: vi.fn() }),
  useUpdateCaseName: () => ({ mutate: vi.fn() }),
  useUpdateCaseSituation: () => ({ mutate: vi.fn() }),
  useUpdateCaseOwner: () => ({ mutate: mutateMock }),
}));

vi.mock('@/hooks/useUsers', () => ({
  useUsers: () => ({ data: [{ id: 'u1', name: 'User 1' }], isLoading: false }),
}));

vi.mock('react-select', () => ({
  __esModule: true,
  default: ({ options, value, onChange, placeholder }: any) => (
    <select
      data-testid="react-select"
      value={value?.value ?? ''}
      onChange={(e) => {
        const opt = options.find((o: any) => o.value === e.target.value) || null;
        onChange && onChange(opt, null);
      }}
      aria-label={placeholder}
    >
      <option value="">{placeholder || 'select'}</option>
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  ),
}));

describe('VinculosPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // espiona apenas React.use para evitar mockar todo o módulo react
    vi.spyOn(React, 'use').mockImplementation((p: Promise<any>) => {
      let result: any;
      // mantém comportamento assíncrono similar ao original usado nos testes
      p.then(r => { result = r });
      return result || { id: 'mock-id' };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('render page components correctly', async () => {
    const params = Promise.resolve({ id: '123' });
    render(<VinculosPage params={params} />);

    expect(await screen.findByTestId('aba-vinculos')).toBeInTheDocument();
    expect(await screen.findByTestId('filter-component')).toBeInTheDocument();
    expect(await screen.findByTestId('graph-container')).toBeInTheDocument();
  });

  it('opens change-responsible modal and calls update owner mutation', async () => {
    const params = Promise.resolve({ id: '123' });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <GeneralInfoPage params={params} />
      </QueryClientProvider>
    );

    const openButton = await screen.findByText('Alterar responsável');
    fireEvent.click(openButton);

    const select = await screen.findByTestId('react-select');
    fireEvent.change(select, { target: { value: 'u1' } });

    const saveButton = await screen.findByText('Salvar');
    fireEvent.click(saveButton);

    expect(mutateMock).toHaveBeenCalledWith(
      { caseId: '123', userId: 'u1' },
      expect.any(Object)
    );
  });
});
