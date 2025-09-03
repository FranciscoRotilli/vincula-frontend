'use client'

import React, { useState } from 'react';
import GenericTable from '@/components/genericTable/GenericTable';
import styles from '@/app/home/page.module.css';
import Footer from '@/components/footer/Footer';
import NavbarContainer from '@/components/Navbar/NavbarComponent';
import Button from '@/components/Button/Button';
import { Column } from '@/types/Table';

const columns: Column<typeof data[0]>[] = [
  { key: "case", label: "Caso", align: "left" },
  { key: "responsible", label: "Responsável", align: "left" },
  { key: "status", label: "Situação", align: "left" },
  { key: "openedAt", label: "Data de Abertura", align: "left" },
];

const data = [
  { id: 1, case: "Caso 001", responsible: "João Silva", status: "Aberto", openedAt: "2025-08-20" },
  { id: 2, case: "Caso 002", responsible: "Maria Souza", status: "Em andamento", openedAt: "2025-08-21" },
  { id: 3, case: "Caso 003", responsible: "Pedro Santos", status: "Concluído", openedAt: "2025-08-22" },
  { id: 4, case: "Caso 004", responsible: "Ana Oliveira", status: "Aberto", openedAt: "2025-08-23" },
  { id: 5, case: "Caso 005", responsible: "Carlos Pereira", status: "Em andamento", openedAt: "2025-08-24" },
  { id: 6, case: "Caso 006", responsible: "Fernanda Lima", status: "Concluído", openedAt: "2025-08-25" },
  { id: 7, case: "Caso 007", responsible: "Ricardo Alves", status: "Aberto", openedAt: "2025-08-26" },
  { id: 8, case: "Caso 008", responsible: "Juliana Costa", status: "Em andamento", openedAt: "2025-08-27" },
  { id: 9, case: "Caso 009", responsible: "Marcos Rocha", status: "Concluído", openedAt: "2025-08-28" },
  { id: 10, case: "Caso 010", responsible: "Patrícia Martins", status: "Aberto", openedAt: "2025-08-29" },
];

const rowActions = [
  // {
  //   label: "Editar",
  //   icon: <Edit />,
  //   onClick: (row: unknown) => console.log("Editar", row),
  // },
  // {
  //   label: "Excluir",
  //   icon: <DeleteOutline />,
  //   onClick: (row: unknown) => console.log("Excluir", row),
  // },
  {
    label: "Ver detalhes",
    onClick: (row: unknown) => console.log("Ver detalhes", row),
  },
];


export default function Home() {
  return (
    <div>
      <NavbarContainer />
      <Button
        label="ADICIONAR CASO"
        variant="contained"
        size="medium"
        onClick={() => console.log("Botão clicado!")}
        className="btnAdicionarCaso"
      />
      <main className={styles.main}>
        <GenericTable
          columns={columns}
          data={data}
          loading={false}
          selectable
          rowActions={rowActions}
        />
      </main>
      <Footer />
    </div>
  );
}
