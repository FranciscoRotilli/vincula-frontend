import { render, screen } from '@testing-library/react';
import React from 'react';

import GenericTable from '@/components/GenericTable';
import { Column } from '@/types/Table';

type Row = { id: number; name: string; email: string };

const mockData: Row[] = [
  { id: 1, name: 'João', email: 'joao@email.com' },
  { id: 2, name: 'Maria', email: 'maria@email.com' },
  { id: 3, name: 'Pedro', email: 'pedro@email.com' },
  { id: 4, name: 'Ana', email: 'ana@email.com' },
  { id: 5, name: 'Carlos', email: 'carlos@email.com' },
  { id: 6, name: 'Fernanda', email: 'fernanda@email.com' },
];

const columns: Column<Row>[] = [
  { key: 'name', label: 'Nome' },
  { key: 'email', label: 'E-mail' },
];

describe('GenericTable component', () => {
  it('renders columns and data correctly', () => {
    render(<GenericTable columns={columns} data={mockData} loading={false} variant="outlined" />);
    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('E-mail')).toBeInTheDocument();
    expect(screen.getByText('João')).toBeInTheDocument();
  });

  it('shows loading', () => {
    render(<GenericTable columns={columns} data={[]} loading={true} variant="outlined" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<GenericTable columns={columns} data={[]} loading={false} variant="outlined" />);
    expect(screen.getByTestId('generic-table-no-data')).toBeInTheDocument();
  });
});
