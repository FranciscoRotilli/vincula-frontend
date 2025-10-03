'use client';

import AddIcon from '@mui/icons-material/Add';
import { useRouter } from "next/navigation";
import React, { useState } from 'react';

import Button from '@/components/Button';
import Filter, { FieldConfig, FilterValues } from '@/components/Filter';
import Footer from '@/components/Footer';
import Table from '@/components/GenericTable';
import CreateCaseModal from '@/components/Modals/CreateCaseModal';
import NavbarContainer from '@/components/Navbar/NavbarComponent';
import { useCase, useCases } from '@/hooks/useCase';
import { t } from '@/texts';
import { ApiSortingParams, CaseItem, CaseStatus, FilterParams } from '@/types/Cases';
import { Column, Sorting } from '@/types/Table';

import styles from './page.module.css';

const columns: Column<CaseItem>[] = [
  { key: 'name', label: 'Caso', align: 'left' },
  { key: 'owner', label: 'Responsável', align: 'left' },
  { key: 'status', label: 'Situação', align: 'left' },
  { key: 'creation_date', label: 'Data de Abertura', align: 'left' },
];

const situations: { value: CaseStatus; label: string }[] = [
  { value: 'Em andamento', label: 'Em andamento' },
  { value: 'Encerrado', label: 'Encerrado' },
  { value: 'Suspenso', label: 'Suspenso' },
];

const filterFields: FieldConfig[] = [
  { key: 'caseNumber', label: t('modal.caseNumber'), placeholder: 'Insira o número do caso', type: 'input', testId: 'case-number-input' },
  { key: 'caseName', label: t('modal.caseName'), placeholder: 'Insira o nome do caso', type: 'input', testId: 'case-name-input' },
  { key: 'responsible', label: t('modal.owner'), placeholder: 'Insira o responsável', type: 'input', testId: 'case-responsible-input' },
  { key: 'situation', label: t('filter.situation'), placeholder: 'Situação', type: 'select', testId: 'situation-input' , options: situations },
];

function mapUiFiltersToApiParams(uiFilters: FilterValues): FilterParams {
  return {
    status: uiFilters.situation,
    owner: uiFilters.responsible,
    name: uiFilters.search || uiFilters.caseName || uiFilters.caseNumber,
  };
}

function mapUiSortingToApiParams(uiSorting: Sorting<CaseItem>): ApiSortingParams {
  return {
    sort_by: uiSorting.sortBy as 'name' | 'status' | 'creation_date',
    sort_dir: uiSorting.sortDir,
  };
}

export default function Casos() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [filters, setFilters] = useState<FilterValues>({});
  const apiFilterParams = mapUiFiltersToApiParams(filters);
  const [sorting, setSorting] = useState<Sorting<CaseItem>>({
    sortBy: 'creation_date',
    sortDir: 'desc',
  });
  const apiSortingParams = mapUiSortingToApiParams(sorting);

  const {
    data: apiResponse,
    isLoading,
    refetch,
  } = useCases(pagination, apiFilterParams, apiSortingParams);

  const cases = apiResponse?.items || [];

  const caseMutation = useCase();

  const rowActions = [
    {
      label: "Ver detalhes",
      onClick: (obj: CaseItem) => {
        router.push("/casos/" + obj.id);
      },
    },
  ];

  const handleFilter = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleSortChange = (newSorting: Sorting<CaseItem>) => {
    setSorting(newSorting);
  };

  const handleClear = () => {
    setFilters({});
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handlePageChange = (newPage: number, newLimit: number) => {
    setPagination({ page: newPage + 1, limit: newLimit });
  };

  const handleCreateCase = (payload: { caseName: string }) => {
    const apiPayload: { name: string } = {
      name: payload.caseName,
    };

    caseMutation.mutate(apiPayload, {
      onSuccess: (_data) => {
        setIsModalOpen(false);
        refetch();
      },
      onError: (error) => {
        console.error('Erro ao criar caso:', error);
      },
    });
  };

  return (
    <div>
      <NavbarContainer />
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>{t('cases.title')}</h1>
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
          <Filter
            fields={filterFields}
            onFilter={handleFilter}
            onClear={handleClear}
          />
          <Table
            columns={columns}
            data={cases}
            loading={isLoading}
            variant="ghost"
            selectable={false}
            rowActions={rowActions}
            pagination={{
              totalItems: apiResponse?.total ?? 0,
              pageSize: pagination.limit,
              currentPage: pagination.page - 1,
              onPageChange: handlePageChange,
            }}
            sorting={sorting}
            onSort={handleSortChange}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
