import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import FilesSection from '@/components/FilesSection';
import { useCaseById } from '@/hooks/useCase';
import { useRemoveFile } from '@/hooks/useFile';

vi.mock('@/hooks/useCase', () => ({
  useCaseById: vi.fn(),
}));
vi.mock('@/hooks/useFile', () => ({
  useRemoveFile: vi.fn(),
}));

describe('FilesSection Component', () => {
  const mockUseCaseById = useCaseById as any;
  const mockUseRemoveFile = useRemoveFile as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseCaseById.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<FilesSection caseId="case-1" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders empty state message when there are no files', () => {
    mockUseCaseById.mockReturnValue({
      data: { archives: [] },
      isLoading: false,
    });

    render(<FilesSection caseId="case-1" />);
    expect(screen.getByTestId('generic-table-no-data')).toBeInTheDocument();
  });

  it('renders files correctly', () => {
    mockUseCaseById.mockReturnValue({
      data: {
        archives: [
          {
            id: '1',
            name: 'ExtratoDetalhado.csv',
            creation_date: '10 Ago 2025 10:00:00',
            size: '4MB',
          },
          { id: '2', name: 'Extrato_2.xlsx', creation_date: '10 Ago 2025 10:00:00', size: '10KB' },
        ],
      },
      isLoading: false,
    });

    render(<FilesSection caseId="case-1" />);

    expect(screen.getByText('ExtratoDetalhado.csv')).toBeInTheDocument();
    expect(screen.getByText('Extrato_2.xlsx')).toBeInTheDocument();
  });

  it('opens modal and removes file', async () => {
    const mockMutate = vi.fn((_id, opts) => {
      opts?.onSuccess?.();
    });

    mockUseCaseById.mockReturnValue({
      data: {
        archives: [
          {
            id: '1',
            name: 'ExtratoDetalhado.csv',
            creation_date: '10 Ago 2025 10:00:00',
            size: '4MB',
          },
        ],
      },
      isLoading: false,
    });
    mockUseRemoveFile.mockReturnValue({ mutate: mockMutate });

    render(<FilesSection caseId="case-1" />);

    const deleteIcon = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteIcon);

    const removeButton = screen.getByRole('button', { name: 'Remover' });

    expect(removeButton).toBeInTheDocument();

    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith('1', expect.any(Object));
    });
  });
});
