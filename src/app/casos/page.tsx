'use client';

import AddIcon from '@mui/icons-material/Add';
import React, { useState } from 'react';

import Button from '@/components/Button';
import Filter, { FilterValues } from '@/components/Filter';
import Footer from '@/components/Footer';
import Table from '@/components/GenericTable';
import CreateCaseModal from '@/components/Modals/CreateCaseModal';
import NavbarContainer from '@/components/Navbar/NavbarComponent';
import { Column } from '@/types/Table';

import styles from './page.module.css';

const columns: Column<(typeof data)[0]>[] = [
  { key: 'case', label: 'Caso', align: 'left' },
  { key: 'responsible', label: 'Responsável', align: 'left' },
  { key: 'status', label: 'Situação', align: 'left' },
  { key: 'openedAt', label: 'Data de Abertura', align: 'left' },
];

const data = [
  { id: 1, case: 'Caso 001', responsible: 'João Silva', status: 'Aberto', openedAt: '2025-08-20' },
  { id: 2, case: 'Caso 002', responsible: 'Maria Souza', status: 'Em andamento', openedAt: '2025-08-21' },
  { id: 3, case: 'Caso 003', responsible: 'Pedro Santos', status: 'Concluído', openedAt: '2025-08-22' },
  { id: 4, case: 'Caso 004', responsible: 'Ana Oliveira', status: 'Aberto', openedAt: '2025-08-23' },
  { id: 5, case: 'Caso 005', responsible: 'Carlos Pereira', status: 'Em andamento', openedAt: '2025-08-24' },
  { id: 6, case: 'Caso 006', responsible: 'Fernanda Lima', status: 'Concluído', openedAt: '2025-08-25' },
  { id: 7, case: 'Caso 007', responsible: 'Ricardo Alves', status: 'Aberto', openedAt: '2025-08-26' },
  { id: 8, case: 'Caso 008', responsible: 'Juliana Costa', status: 'Em andamento', openedAt: '2025-08-27' },
  { id: 9, case: 'Caso 009', responsible: 'Marcos Rocha', status: 'Concluído', openedAt: '2025-08-28' },
  { id: 10, case: 'Caso 010', responsible: 'Patrícia Martins', status: 'Aberto', openedAt: '2025-08-29' },
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

export default function Casos() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cases, setCases] = useState(data);
  const [filteredData, setFilteredData] = useState(data);

  const handleFilter = (filters: FilterValues) => {
    const filtered = cases.filter((item) => {
      const search = filters.search?.toLowerCase();
      const caseNumber = filters.caseNumber?.toLowerCase();
      const caseName = filters.caseName?.toLowerCase();
      const responsible = filters.responsible?.toLowerCase();
      const situation = filters.situation?.toLowerCase();

      const itemCase = item.case.toLowerCase();
      const itemResponsible = item.responsible.toLowerCase();
      const itemStatus = item.status.toLowerCase();

      const matchesSearch =
        !search || itemCase.includes(search) || itemResponsible.includes(search);
      const matchesCaseNumber = !caseNumber || itemCase.includes(caseNumber);
      const matchesCaseName = !caseName || itemCase.includes(caseName);
      const matchesResponsible = !responsible || itemResponsible.includes(responsible);
      const matchesSituation = !situation || itemStatus === situation;

      return (
        matchesSearch &&
        matchesCaseNumber &&
        matchesCaseName &&
        matchesResponsible &&
        matchesSituation
      );
    });

    setFilteredData(filtered);
  };

  const handleClear = () => {
    setFilteredData(cases);
  };

  const handleCreateCase =
    (payload: { caseName: string; caseResponsable: string; creationDate: string }) => {
      const newCase = {
        id: cases.length + 1,
        case: payload.caseName,
        responsible: payload.caseResponsable,
        status: 'Aberto',
        openedAt: payload.creationDate,
      };

      const updatedCases = [...cases, newCase];
      setCases(updatedCases);
      setFilteredData(updatedCases);
      setIsModalOpen(false);
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
        <CreateCaseModal isOpen={isModalOpen} onClose={() =>
          setIsModalOpen(false)} onSubmit={handleCreateCase} />
        <div className={styles.tableContainer}>
          <Filter onFilter={handleFilter} onClear={handleClear} situations={situations} />
          <Table
            columns={columns}
            data={filteredData}
            loading={false}
            selectable={false}
            rowActions={rowActions}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
