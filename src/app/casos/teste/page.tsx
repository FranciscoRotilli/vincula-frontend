/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';

import GeneralTab from '../ViewCase';

// MOCKS
const mockCaseDetails = {
  id: '1',
  name: 'Operação Ratatouille',
  owner: 'Cicrano',
  status: 'Em andamento',
  creation_date: '10 de Agosto 2025',
	number: '1',
	updated_at: '10 de Agosto 2025',
};

const mockEnvolvidos = [
  { id: 1, nome: 'BETO BARBOSA', cpf: '494.392.650-94' },
  { id: 2, nome: 'ZITA AMELI', cpf: '933.250.630-20' },
  { id: 3, nome: 'TESTE', cpf: '494.392.650-94' },
  { id: 4, nome: 'TESTE 2', cpf: '933.250.630-20' },
];

const mockArquivos = [
  { id: 1, nome: 'ExtratoDetalhado.csv', tipo: 'SIMBA', data: '10 Ago 2025 10:00:00', tamanho: '4.2 MB' },
  { id: 2, nome: 'Extrato_2.xlsx', tipo: 'SIMBA', data: '10 Ago 2025 10:00:00', tamanho: '21 KB' },
];

// Contexto para mocks
const MockContext = React.createContext<any>(null);

export function useMockData() {
  return React.useContext(MockContext);
}

// Exemplo de como adaptar seus hooks para usar mocks se o contexto existir
// No início de cada hook (ex: useCaseById), adicione:
// const mock = useMockData(); if (mock?.caseDetails) return { data: mock.caseDetails, ... };

export default function TesteCasosPage() {
  const mockValue = React.useMemo(() => ({
    caseDetails: mockCaseDetails,
    envolvidos: mockEnvolvidos,
    arquivos: mockArquivos,
  }), []);

  return (
    <MockContext.Provider value={mockValue}>
      <GeneralTab caseId="1" />
    </MockContext.Provider>
  );
}