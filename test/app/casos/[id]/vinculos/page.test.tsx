import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

  it('wraps content with CaseContainer', async () => {
    const params = Promise.resolve({ id: '123' });
    render(<VinculosPage params={params} />);

    const container = await screen.findByTestId('aba-container');
    expect(container).toBeInTheDocument();
    expect(within(container).getByTestId('aba-vinculos')).toBeInTheDocument();
  });

  it('allows re-render with different params without throwing', async () => {
    const params1 = Promise.resolve({ id: '1' });
    const { unmount } = render(<VinculosPage params={params1} />);

    expect(await screen.findByTestId('aba-vinculos')).toBeInTheDocument();

    unmount();

    const params2 = Promise.resolve({ id: '2' });
    render(<VinculosPage params={params2} />);

    expect(await screen.findByTestId('aba-vinculos')).toBeInTheDocument();
    expect(await screen.findByTestId('filter-component')).toBeInTheDocument();
    expect(await screen.findByTestId('graph-container')).toBeInTheDocument();
  });
});
