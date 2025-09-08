'use client';

import AddIcon from '@mui/icons-material/Add';
import React, { useState } from 'react';

import Button from '@/components/Button';
import Filter, { FilterValues } from '@/components/Filter';
import Footer from '@/components/Footer';
import Table from '@/components/GenericTable';
import CreateCaseModal from '@/components/Modals/CreateCaseModal';
import NavbarContainer from '@/components/Navbar/NavbarComponent';
import { useCase, useCases } from '@/hooks/useCase';
import { CaseItem, FilterParams } from '@/types/Cases';
import { Column } from '@/types/Table';

import styles from './page.module.css';

const columns: Column<CaseItem>[] = [
  { key: 'name', label: 'Caso', align: 'left' },
  { key: 'owner', label: 'Responsável', align: 'left' },
  { key: 'status', label: 'Situação', align: 'left' },
  { key: 'creation_date', label: 'Data de Abertura', align: 'left' },
];

const rowActions = [
  {
    label: 'Ver detalhes',
    onClick: (row: unknown) => console.log('Ver detalhes', row),
  },
];

const situations = [
  { value: 'Aberto', label: 'Aberto' },
  { value: 'Em andamento', label: 'Em andamento' },
  { value: 'Concluído', label: 'Concluído' },
];

function mapUiFiltersToApiParams(uiFilters: FilterValues): FilterParams {
  const apiParams: FilterParams = {
    status: uiFilters.situation,
    owner: uiFilters.responsible,
    name: uiFilters.search || uiFilters.caseName || uiFilters.caseNumber
  };

  Object.keys(apiParams).forEach(key => {
    if (!apiParams[key as keyof FilterParams]) {
      delete apiParams[key as keyof FilterParams];
    }
  });

  return apiParams;
}

export default function Casos() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [pagination, setPagination] = useState({ page: 1, limit: 10 })
  const [filters, setFilters] = useState<FilterValues>({})
  const apiFilterParams = mapUiFiltersToApiParams(filters);
  const { data: apiResponse, isLoading, refetch } = useCases(pagination, apiFilterParams)

  const cases = apiResponse?.items || []

  const caseMutation = useCase();

  const handleFilter = (newFilters: FilterValues) => {
    setFilters(newFilters)
    setPagination(p => ({ ...p,page: 1 }))
  };

  const handleClear = () => {
    setFilters({})
    setPagination(p => ({ ...p,page: 1 }))
  };

  const handlePageChange = (newPage: number, newLimit: number) => {
    setPagination({ page: newPage + 1, limit: newLimit });
  };

  const handleCreateCase = (payload: { caseName: string }) => {
    const apiPayload: { name: string } = {
      name: payload.caseName,
    };

    caseMutation.mutate(
      apiPayload,
      {
        onSuccess: (_data) => {
          setIsModalOpen(false);
          refetch();
        },
        onError: (error) => {
          console.error('Erro ao criar caso:', error);
        }
      }
    );
  };

  return (
    <div>
      <NavbarContainer />
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>Meus Casos</h1>
        <div className={styles.btnContainer}>
          <Button
            label="ADICIONAR CASO"
            variant="contained"
            size="medium"
            icon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
            className="btnAdicionarCaso"
          />
        </div>
        <CreateCaseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateCase}
        />
        <div className={styles.tableContainer}>
          <Filter onFilter={handleFilter} onClear={handleClear} situations={situations} />
          <Table
            columns={columns}
            data={cases}
            loading={isLoading}
            selectable={false}
            rowActions={rowActions}
            pagination={{
              totalItems: apiResponse?.total ?? 0,
              pageSize: pagination.limit,
              currentPage: pagination.page - 1,
              onPageChange: handlePageChange,
            }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
