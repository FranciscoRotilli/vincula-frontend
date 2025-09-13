import '@testing-library/jest-dom';

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import CaseTabs from '../../../src/components/CaseContainer/CaseTabs';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/casos/123',
}));

describe('CaseTabs Component', () => {
  test('should render the three tabs correctly', () => {
    render(<CaseTabs caseId="123" />);

    expect(screen.getByTestId('tab-general-info')).toBeInTheDocument();
    expect(screen.getByTestId('tab-vinculos')).toBeInTheDocument();
    expect(screen.getByTestId('tab-visualizacao')).toBeInTheDocument();
  });

  test('should highlight the "General Info" tab as active on the base route', () => {
    render(<CaseTabs caseId="123" />);
    
    const generalInfoTab = screen.getByTestId('tab-general-info');
    expect(generalInfoTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should call router.push with the correct URL when the "Vinculos" tab is clicked', () => {
    render(<CaseTabs caseId="123" />);

    const vinculosTab = screen.getByTestId('tab-vinculos');
    fireEvent.click(vinculosTab);

    expect(mockPush).toHaveBeenCalledWith('/casos/123/vinculos');
  });
});
