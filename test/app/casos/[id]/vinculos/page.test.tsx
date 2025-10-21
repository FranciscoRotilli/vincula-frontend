import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import VinculosPage from '../../../../../src/app/casos/[id]/vinculos/page';

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

vi.mock('@/components/CaseContainer', () => ({
  CaseContainer: ({ children, ...props }) => (
    <div data-testid="aba-container" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    use: (p: Promise<any>) => {
      let result: any;
      p.then((r) => {
        result = r;
      });
      return result || { id: 'mock-id' };
    },
  };
});

describe('VinculosPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('render page components correctly', async () => {
    const params = Promise.resolve({ id: '123' });
    renderWithQueryClient(<VinculosPage params={params} />);

    expect(await screen.findByTestId('aba-vinculos')).toBeInTheDocument();
    expect(await screen.findByTestId('filter-component')).toBeInTheDocument();
    expect(await screen.findByTestId('graph-container')).toBeInTheDocument();
  });
});
