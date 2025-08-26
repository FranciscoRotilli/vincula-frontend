'use client';

// import Image from 'next/image';
import React from 'react';

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
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <GenericTable
          columns={columns}
          data={data}
          loading={false}
          selectable
          onRowClick={(row) => console.log(row)}
        />
      </main>
      {/* <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>src/app/page.tsx</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer> */}
    </div>
  );
}
