'use client';

// import Image from 'next/image';
import React, { useState } from 'react';

import GenericTable, { Column } from "../components/generic-table/generic-table";
import styles from "./page.module.css";

const data = [
  { id: 1, name: 'João Silva', cpf: '12345678901', email: 'joao.silva@email.com' },
  { id: 2, name: 'Maria Souza', cpf: '23456789012', email: 'maria.souza@email.com' },
  { id: 3, name: 'Pedro Santos', cpf: '34567890123', email: 'pedro.santos@email.com' },
  { id: 4, name: 'Ana Oliveira', cpf: '45678901234', email: 'ana.oliveira@email.com' },
  { id: 5, name: 'Carlos Pereira', cpf: '56789012345', email: 'carlos.pereira@email.com' },
  { id: 6, name: 'Fernanda Lima', cpf: '67890123456', email: 'fernanda.lima@email.com' },
  { id: 7, name: 'Ricardo Alves', cpf: '78901234567', email: 'ricardo.alves@email.com' },
  { id: 8, name: 'Juliana Costa', cpf: '89012345678', email: 'juliana.costa@email.com' },
  { id: 9, name: 'Marcos Rocha', cpf: '90123456789', email: 'marcos.rocha@email.com' },
  { id: 10, name: 'Patrícia Martins', cpf: '01234567890', email: 'patricia.martins@email.com' },
];

const columns: Column<typeof data[0]>[] = [
  { key: "name", label: "Nome", align: "left" },
  { key: "email", label: "E-mail", align: "center" },
  { key: "cpf", label: "CPF", align: "center" },
  { key: "id", label: "ID", align: "right", render: (value) => <strong>#{value}</strong> },
];

export default function Home() {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // mock paginacao backend
  const paginatedData = data.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  const pagination = {
    currentPage,
    pageSize,
    totalItems: data.length,
    onPageChange: (page: number, newPageSize: number) => {
      setCurrentPage(page);
      setPageSize(newPageSize);
    },
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <GenericTable
          columns={columns}
          data={paginatedData}
          loading={false}
          selectable
          pagination={pagination} // se passar, server side, se não, client-side
        />
      </main>
    </div>
  );
}
