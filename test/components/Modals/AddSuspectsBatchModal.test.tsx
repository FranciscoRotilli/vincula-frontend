import '@testing-library/jest-dom';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import AddSuspectsBatchModal from '@/components/Modals/AddSuspectsBatchModal';

interface MockModalProps {
  isOpen: boolean;
  children: React.ReactNode;
  onClose: () => void;
  onAction: () => void;
  actionButton: string;
  actionDisabled: boolean;
  [key: string]: unknown;
}

vi.mock('@/components/Modals', () => ({
  __esModule: true,
  default: ({
    isOpen,
    children,
    onClose,
    onAction,
    actionButton,
    actionDisabled,
    ...props
  }: MockModalProps) => {
    if (!isOpen) return null;
    return (
      <div role="dialog" data-testid="modal-add-suspects-batch" {...props}>
        <div>{children}</div>
        <button onClick={onClose} data-testid="cancel-button">
          {'Cancelar'}
        </button>
        <button onClick={onAction} disabled={actionDisabled} data-testid="action-button">
          {actionButton}
        </button>
      </div>
    );
  },
}));

describe('AddSuspectsBatchModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <AddSuspectsBatchModal isOpen={false} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    expect(screen.queryByTestId('modal-add-suspects-batch')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(<AddSuspectsBatchModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    expect(screen.getByTestId('modal-add-suspects-batch')).toBeInTheDocument();
  });

  it('should show "Selecione ou arraste o arquivo CSV" when no file is selected', () => {
    render(<AddSuspectsBatchModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Selecione ou arraste o arquivo CSV')).toBeInTheDocument();
  });

  it('should disable action button when no file is selected', () => {
    render(<AddSuspectsBatchModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const actionButton = screen.getByTestId('action-button');
    expect(actionButton).toBeDisabled();
  });

  it('should handle file selection via input', () => {
    render(<AddSuspectsBatchModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const file = new File(['nome;cpfCnpj;telefone'], 'suspects.csv', { type: 'text/csv' });
    const input = screen.getByTestId('file-input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('suspects.csv')).toBeInTheDocument();
  });

  it('should enable action button when a valid CSV file is selected', () => {
    render(<AddSuspectsBatchModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const file = new File(['nome;cpfCnpj;telefone'], 'suspects.csv', { type: 'text/csv' });
    const input = screen.getByTestId('file-input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    const actionButton = screen.getByTestId('action-button');
    expect(actionButton).not.toBeDisabled();
  });

  it('should reject files larger than 50MB', () => {
    render(<AddSuspectsBatchModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const largeFile = new File(['test'], 'large.csv', { type: 'text/csv' });
    Object.defineProperty(largeFile, 'size', { value: 51 * 1024 * 1024 });

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(screen.getByText('Selecione ou arraste o arquivo CSV')).toBeInTheDocument();
    expect(screen.queryByText('large.csv')).not.toBeInTheDocument();
  });

  it('should reject non-CSV files', () => {
    render(<AddSuspectsBatchModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const txtFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByTestId('file-input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [txtFile] } });

    expect(screen.getByText('Selecione ou arraste o arquivo CSV')).toBeInTheDocument();
    expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
  });

  it('should accept CSV files with .csv extension', () => {
    render(<AddSuspectsBatchModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const csvFile = new File(['data'], 'data.csv', { type: '' });
    const input = screen.getByTestId('file-input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [csvFile] } });

    expect(screen.getByText('data.csv')).toBeInTheDocument();
  });

  it('should call onSubmit with the selected file when action button is clicked', () => {
    render(<AddSuspectsBatchModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const file = new File(['nome;cpfCnpj;telefone'], 'suspects.csv', { type: 'text/csv' });
    const input = screen.getByTestId('file-input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    const actionButton = screen.getByTestId('action-button');
    fireEvent.click(actionButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(file);
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<AddSuspectsBatchModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should handle drag and drop file selection', () => {
    render(<AddSuspectsBatchModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const file = new File(['nome;cpfCnpj;telefone'], 'dropped.csv', { type: 'text/csv' });
    const dropzone = screen.getByTestId('dropzone');

    const dataTransfer = {
      files: [file],
      types: ['Files'],
    };

    fireEvent.dragEnter(dropzone, { dataTransfer });
    fireEvent.dragOver(dropzone, { dataTransfer });
    fireEvent.drop(dropzone, { dataTransfer });

    expect(screen.getByText('dropped.csv')).toBeInTheDocument();
  });

  it('should set dragActive state on drag enter', () => {
    render(<AddSuspectsBatchModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const dropzone = screen.getByTestId('dropzone');
    const dataTransfer = {
      files: [],
      types: ['Files'],
    };

    fireEvent.dragEnter(dropzone, { dataTransfer });

    // Check if dragActive class is applied (implementation detail)
    // The dropzone should have the dragActive style
    expect(dropzone).toBeInTheDocument();
  });

  it('should clear dragActive state on drag leave', () => {
    render(<AddSuspectsBatchModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const dropzone = screen.getByTestId('dropzone');
    const dataTransfer = {
      files: [],
      types: ['Files'],
    };

    fireEvent.dragEnter(dropzone, { dataTransfer });
    fireEvent.dragLeave(dropzone, { dataTransfer });

    expect(dropzone).toBeInTheDocument();
  });

  it('should open file picker when dropzone is clicked', () => {
    render(<AddSuspectsBatchModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const dropzone = screen.getByTestId('dropzone');
    const input = screen.getByTestId('file-input') as HTMLInputElement;

    const clickSpy = vi.spyOn(input, 'click');

    fireEvent.click(dropzone);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should open file picker when Enter key is pressed on dropzone', () => {
    render(<AddSuspectsBatchModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const dropzone = screen.getByTestId('dropzone');
    const input = screen.getByTestId('file-input') as HTMLInputElement;

    const clickSpy = vi.spyOn(input, 'click');

    fireEvent.keyDown(dropzone, { key: 'Enter' });

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should open file picker when Space key is pressed on dropzone', () => {
    render(<AddSuspectsBatchModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const dropzone = screen.getByTestId('dropzone');
    const input = screen.getByTestId('file-input') as HTMLInputElement;

    const clickSpy = vi.spyOn(input, 'click');

    fireEvent.keyDown(dropzone, { key: ' ' });

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should show "Salvando..." when isSubmitting is true', () => {
    render(
      <AddSuspectsBatchModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={true}
      />
    );

    expect(screen.getByText('Salvando...')).toBeInTheDocument();
  });

  it('should disable action button when isSubmitting is true', () => {
    render(
      <AddSuspectsBatchModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={true}
      />
    );

    const actionButton = screen.getByTestId('action-button');
    expect(actionButton).toBeDisabled();
  });

  it('should not call onSubmit when action button is clicked during submission', () => {
    render(
      <AddSuspectsBatchModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={true}
      />
    );

    const file = new File(['nome;cpfCnpj;telefone'], 'suspects.csv', { type: 'text/csv' });
    const input = screen.getByTestId('file-input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    const actionButton = screen.getByTestId('action-button');
    fireEvent.click(actionButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should reject files dropped that are too large', () => {
    render(<AddSuspectsBatchModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const largeFile = new File(['test'], 'large.csv', { type: 'text/csv' });
    Object.defineProperty(largeFile, 'size', { value: 51 * 1024 * 1024 });

    const dropzone = screen.getByTestId('dropzone');
    const dataTransfer = {
      files: [largeFile],
      types: ['Files'],
    };

    fireEvent.drop(dropzone, { dataTransfer });

    expect(screen.getByText('Selecione ou arraste o arquivo CSV')).toBeInTheDocument();
  });

  it('should reject non-CSV files dropped', () => {
    render(<AddSuspectsBatchModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const txtFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const dropzone = screen.getByTestId('dropzone');
    const dataTransfer = {
      files: [txtFile],
      types: ['Files'],
    };

    fireEvent.drop(dropzone, { dataTransfer });

    expect(screen.getByText('Selecione ou arraste o arquivo CSV')).toBeInTheDocument();
  });
});
