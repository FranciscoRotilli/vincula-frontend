import '@testing-library/jest-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { CaseContainer } from '../../../src/components/CaseContainer';

const queryClient = new QueryClient();


function renderWithQueryClient(ui: React.ReactElement) {
	return render(
		<QueryClientProvider client={queryClient}>
			{ui}
		</QueryClientProvider>
	);
}

vi.mock('@/services/userService', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ name: 'Test User' }),
  logout: vi.fn().mockResolvedValue(true),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
}));

vi.mock('../../../src/components/CaseContainer/CaseContainer.module.css', () => ({ default: {} }));

describe('CaseContainer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render the main container element', () => {
    renderWithQueryClient(
      <CaseContainer caseId="test-id">
        <p>Test content</p>
      </CaseContainer>
    );
    expect(screen.getByTestId('case-container')).toBeInTheDocument();
  });

  test('should render the Navbar, Footer, Tabs, and child content', () => {
    renderWithQueryClient(
      <CaseContainer caseId="test-id">
        <p>Test content</p>
      </CaseContainer>
    );

    expect(screen.getByTestId('navbar-component')).toBeInTheDocument();
    expect(screen.getByTestId('footer-component')).toBeInTheDocument();
    expect(screen.getByTestId('tabs-component')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
});

