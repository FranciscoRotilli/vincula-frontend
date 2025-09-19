import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ---- Mocks
// Mock do componente Modal para isolar o comportamento do AddFileModal
vi.mock('@/components/Modals', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, title, children, ...rest }: any) =>
    isOpen ? (
      <div role="dialog" aria-label={title} data-testid="mocked-modal" {...rest}>
        <button aria-label="Fechar" onClick={onClose} />
        {children}
      </div>
    ) : null,
}));

// Mock do CSS Module para evitar falhas de import e permitir verificações de classe
vi.mock('./AddFileModal.module.css', () => ({
  __esModule: true,
  default: {
    addfileTheme: 'addfileTheme',
    form: 'form',
    row: 'row',
    field: 'field',
    fieldFull: 'fieldFull',
    fileBlock: 'fileBlock',
    label: 'label',
    required: 'required',
    selectWrapper: 'selectWrapper',
    select: 'select',
    placeholder: 'placeholder',
    selectIcon: 'selectIcon',
    inputFile: 'inputFile',
    dropzone: 'dropzone',
    dragActive: 'dragActive',
    dropzoneContent: 'dropzoneContent',
    dropzoneText: 'dropzoneText',
    error: 'error',
    actions: 'actions',
    primaryButton: 'primaryButton',
    invalid: 'invalid',
  },
}));

import AddFileModal from '@/components/ModalAddFile';

// Helpers para arquivos
const makeFile = (name: string, type: string, sizeBytes?: number) => {
  const blob = sizeBytes ? new Blob([new ArrayBuffer(sizeBytes)], { type }) : new Blob(['data'], { type });
  return new File([blob], name, { type });
};

const openModal = (overrides: Partial<React.ComponentProps<typeof AddFileModal>> = {}) => {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  } as React.ComponentProps<typeof AddFileModal>;
  render(<AddFileModal {...props} />);
  return props;
};

// --------------------------------------------------------
// Testes
// --------------------------------------------------------

describe('AddFileModal', () => {
  test('does not render when isOpen=false', () => {
    render(<AddFileModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('renders essential fields when open', () => {
    openModal();
    // Selects de Origem e Tipo
    expect(screen.getByLabelText(/Origem/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo/i)).toBeInTheDocument();
    // Dropzone / input de arquivo (via label "Arquivo")
    expect(screen.getByLabelText(/Arquivo/i)).toBeInTheDocument();
    // Botão de ação
    expect(screen.getByRole('button', { name: /Adicionar/i })).toBeInTheDocument();
  });

  test('validation on submit without filling (shows errors and focuses the first invalid field)', async () => {
    openModal();

    await userEvent.click(screen.getByRole('button', { name: /Adicionar/i }));

    const originError = await screen.findByRole('alert', { name: '' }); // primeiro erro (Origem)
    expect(originError).toHaveTextContent(/Selecione a origem\./i);

    // foco deve ir para o primeiro campo inválido (origem)
    const originSelect = screen.getByLabelText(/Origem/i);
    await waitFor(() => expect(originSelect).toHaveFocus());

    // Deve exibir também erros para Tipo e Arquivo
    expect(screen.getByText(/Selecione o tipo\./i)).toBeInTheDocument();
    expect(screen.getByText(/Envie um arquivo\./i)).toBeInTheDocument();
  });

  test('removes errors when fields are filled and revalidates in real time', async () => {
    openModal();

    await userEvent.click(screen.getByRole('button', { name: /Adicionar/i }));

    // Preenche Origem e Tipo
    await userEvent.selectOptions(screen.getByLabelText(/Origem/i), 'local');
    await userEvent.selectOptions(screen.getByLabelText(/Tipo/i), 'csv');

    // Erros de origem/tipo somem
    expect(screen.queryByText(/Selecione a origem\./i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Selecione o tipo\./i)).not.toBeInTheDocument();
  });

  test('file input accept attribute varies according to the selected Type', async () => {
    openModal();
    const input = screen.getByLabelText(/Arquivo/i) as HTMLInputElement;

    // Sem tipo => aceita todos
    expect(input.getAttribute('accept')).toMatch(/csv|pdf|xlsx/);

    await userEvent.selectOptions(screen.getByLabelText(/Tipo/i), 'pdf');
    expect(input.getAttribute('accept')).toContain('application/pdf');

    await userEvent.selectOptions(screen.getByLabelText(/Tipo/i), 'csv');
    expect(input.getAttribute('accept')).toMatch(/\.csv|text\/csv/);
  });

  test('happy path: fills everything, uploads a valid file, and calls onSubmit + onClose', async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    openModal({ onSubmit, onClose });

    await userEvent.selectOptions(screen.getByLabelText(/Origem/i), 'local');
    await userEvent.selectOptions(screen.getByLabelText(/Tipo/i), 'csv');

    const file = makeFile('dados.csv', 'text/csv');
    const input = screen.getByLabelText(/Arquivo/i) as HTMLInputElement;

    // Dispara alteração do input file
    await userEvent.upload(input, file);

    await userEvent.click(screen.getByRole('button', { name: /Adicionar/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ origin: 'local', type: 'csv', file });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('file larger than 50MB shows an error and prevents submission', async () => {
    const onSubmit = vi.fn();
    openModal({ onSubmit });

    await userEvent.selectOptions(screen.getByLabelText(/Origem/i), 'local');
    await userEvent.selectOptions(screen.getByLabelText(/Tipo/i), 'pdf');

    const big = makeFile('grande.pdf', 'application/pdf', 51 * 1024 * 1024);
    const input = screen.getByLabelText(/Arquivo/i) as HTMLInputElement;
    await userEvent.upload(input, big);

    await userEvent.click(screen.getByRole('button', { name: /Adicionar/i }));

    expect(screen.getByText(/acima de 50 MB/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('file type incompatible with the selected Type shows an error', async () => {
    openModal();

    await userEvent.selectOptions(screen.getByLabelText(/Origem/i), 'local');
    await userEvent.selectOptions(screen.getByLabelText(/Tipo/i), 'pdf');

    const wrong = makeFile('tabela.csv', 'text/csv');
    const input = screen.getByLabelText(/Arquivo/i) as HTMLInputElement;
    await userEvent.upload(input, wrong);

    await userEvent.click(screen.getByRole('button', { name: /Adicionar/i }));

    expect(screen.getByText(/Tipo inválido.*PDF/i)).toBeInTheDocument();
  });

  test('drag and drop: activates style, drops a file and fills the field', async () => {
    openModal();
    const dropzone = screen.getByRole('button', { name: /Selecione ou arraste o arquivo/i });

    // drag enter/over liga a classe
    fireEvent.dragEnter(dropzone);
    expect(dropzone).toHaveClass('dragActive');

    fireEvent.dragOver(dropzone);
    expect(dropzone).toHaveClass('dragActive');

    // drop com arquivo CSV
    const data = {
      dataTransfer: {
        files: [makeFile('dados.csv', 'text/csv')],
      },
    } as any;

    fireEvent.drop(dropzone, data);

    // Nome do arquivo aparece dentro da dropzone
    expect(screen.getByText(/dados\.csv/i)).toBeInTheDocument();
  });

  test('switching the Type after selecting a file revalidates and may mark it as invalid', async () => {
    openModal();

    await userEvent.selectOptions(screen.getByLabelText(/Origem/i), 'local');

    const input = screen.getByLabelText(/Arquivo/i) as HTMLInputElement;
    await userEvent.upload(input, makeFile('dados.csv', 'text/csv'));

    // Força validação completa
    await userEvent.click(screen.getByRole('button', { name: /Adicionar/i }));

    // Ao mudar para PDF, o arquivo CSV deve ser considerado inválido
    await userEvent.selectOptions(screen.getByLabelText(/Tipo/i), 'pdf');

    expect(screen.getByText(/Tipo inválido.*PDF/i)).toBeInTheDocument();
  });

  test('closing via the X button (propagated by Modal) resets the state', async () => {
    const onClose = vi.fn();
    openModal({ onClose });

    await userEvent.selectOptions(screen.getByLabelText(/Origem/i), 's3');
    await userEvent.selectOptions(screen.getByLabelText(/Tipo/i), 'xlsx');
    const input = screen.getByLabelText(/Arquivo/i) as HTMLInputElement;
    await userEvent.upload(input, makeFile('planilha.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'));

    // Fecha no X do modal mockado
    await userEvent.click(screen.getByRole('button', { name: /Fechar/i }));
    expect(onClose).toHaveBeenCalled();

    // Reabrir para confirmar reset (montagem nova)
    render(<AddFileModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />);
    const origin = screen.getByLabelText(/Origem/i) as HTMLSelectElement;
    const type = screen.getByLabelText(/Tipo/i) as HTMLSelectElement;
    expect(origin.value).toBe('');
    expect(type.value).toBe('');
  });
});
