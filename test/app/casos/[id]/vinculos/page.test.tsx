import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach,describe, expect, it, vi } from 'vitest';

import VinculosPage from '../../../../../src/app/casos/[id]/vinculos/page';

vi.mock('@/components/CaseContainer', () => ({
  CaseContainer: ({ children, ...props }) => (
    <div data-testid="aba-container" {...props}>{children}</div>
  ),
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    use: (p: Promise<any>) => {
      let result: any;
      p.then(r => { result = r });
      return result || { id: 'mock-id' };
    }
  };
});

describe('VinculosPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('render page components correctly', async () => {
    const params = Promise.resolve({ id: '123' });
    render(<VinculosPage params={params} />);

    expect(await screen.findByTestId('aba-vinculos')).toBeInTheDocument();
    expect(await screen.findByTestId('filter-component')).toBeInTheDocument();
    expect(await screen.findByTestId('graph-container')).toBeInTheDocument();
  });
});
