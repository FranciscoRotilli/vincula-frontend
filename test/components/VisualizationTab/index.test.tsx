import { fireEvent,render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach,describe, expect, it, vi } from 'vitest';

import { VisualizationTab } from '@/components/VisualizationTab/index';
import * as visualizationService from '@/services/mock/visualizationService';

// Properly typed mock module
vi.mock('@/services/mock/visualizationService', () => ({
  getAvailableFiles: vi.fn(),
  getFileData: vi.fn(),
}));

vi.mock('@/components/Button', () => ({
  __esModule: true,
  default: (
    {
      label,
      onClick,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }
  ) => (
    <button onClick={onClick} {...props}>{label}</button>
  ),
}));

vi.mock('@/components/Filter', () => ({
  __esModule: true,
  default: ({
    onFilter,
    onClear,
  }: {
    onFilter: (filter: { cpfCnpj: string }) => void;
    onClear: () => void;
  }) => (
    <div>
      <button data-testid="filter-button" onClick={() => onFilter({ cpfCnpj: '123' })}>
        Filter
      </button>
      <button data-testid="clear-button" onClick={onClear}>
        Clear
      </button>
    </div>
  ),
}));

vi.mock('@/texts', () => ({
  t: (key: string, opts?: Record<string, unknown>) => key,
}));

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ suspects: [{ name: 'John Doe' }] }),
  })
) as unknown as ReturnType<typeof vi.fn>;

describe('VisualizationTab Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    (visualizationService.getAvailableFiles as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    render(<VisualizationTab caseId="123" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await waitFor(() => expect(visualizationService.getAvailableFiles).toHaveBeenCalled());
  });

  it('renders available files when loaded', async () => {
    (visualizationService.getAvailableFiles as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: '1', name: 'File A' },
      { id: '2', name: 'File B' },
    ]);
    render(<VisualizationTab caseId="123" />);
    await waitFor(() => expect(screen.getByText('File A')).toBeInTheDocument());
    expect(screen.getByText('File B')).toBeInTheDocument();
  });

  it('shows error message if file fetch fails', async () => {
    (visualizationService.getAvailableFiles as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Error')
    );
    render(<VisualizationTab caseId="123" />);
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });

  it('loads file data when clicking a file', async () => {
    (visualizationService.getAvailableFiles as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: '1', name: 'File A' },
    ]);
    (visualizationService.getFileData as ReturnType<typeof vi.fn>).mockResolvedValue({
      columns: ['Name'],
      rows: [{ Name: 'John' }],
    });
    render(<VisualizationTab caseId="123" />);
    await waitFor(() => screen.getByText('File A'));
    fireEvent.click(screen.getByText('File A'));
    await waitFor(() => expect(visualizationService.getFileData).toHaveBeenCalled());
  });

  it('renders table after file data loads', async () => {
    (visualizationService.getAvailableFiles as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: '1', name: 'File A' },
    ]);
    (visualizationService.getFileData as ReturnType<typeof vi.fn>).mockResolvedValue({
      columns: ['Name'],
      rows: [{ Name: 'John' }],
    });
    render(<VisualizationTab caseId="123" />);
    await waitFor(() => screen.getByText('File A'));
    fireEvent.click(screen.getByText('File A'));
    await waitFor(() => screen.getByText('John'));
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('applies and clears filters correctly', async () => {
    (visualizationService.getAvailableFiles as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: '1', name: 'File A' },
    ]);
    (visualizationService.getFileData as ReturnType<typeof vi.fn>).mockResolvedValue({
      columns: ['CPF/CNPJ ORIGEM'],
      rows: [{ 'CPF/CNPJ ORIGEM': '123' }],
    });
    render(<VisualizationTab caseId="123" />);
    await waitFor(() => screen.getByText('File A'));
    fireEvent.click(screen.getByText('File A'));
    await waitFor(() => screen.getByTestId('filter-button'));
    fireEvent.click(screen.getByTestId('filter-button'));
    fireEvent.click(screen.getByTestId('clear-button'));
    expect(screen.getByTestId('filter-button')).toBeInTheDocument();
  });
});
