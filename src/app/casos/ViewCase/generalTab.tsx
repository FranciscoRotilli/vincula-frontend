/* eslint-disable react/no-children-prop */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { TbTrash } from 'react-icons/tb';

import Button from '@/components/Button';
import GenericTable from '@/components/GenericTable';
import Modal from '@/components/Modals';
import CreateCaseModal from '@/components/Modals/CreateCaseModal';
import { Column } from '@/types/Table';

import styles from './generalTab.module.css';

// Mock
const caseDetails = {
  nome: 'Operação Ratatouille',
  responsavel: 'Cicrano',
  dataCriacao: '10 de Agosto 2025',
  situacao: 'Em andamento',
  codigo: '#000010',
  dataAtualizacao: '-',
};

type EnvolvidoRow = { id: number; nome: string; cpf: string };
type ArquivoRow = { id: number; nome: string; tipo: string; data: string; tamanho: string };

const envolvidosMock = [
  { id: 1, nome: 'BETO BARBOSA', cpf: '494.392.650-94' },
  { id: 2, nome: 'ZITA AMELI', cpf: '933.250.630-20' },
  { id: 3, nome: 'TESTE', cpf: '494.392.650-94' },
  { id: 4, nome: 'TESTE 2', cpf: '933.250.630-20' },
];

const arquivosMock: (EnvolvidoRow | ArquivoRow)[] = [
  { id: 1, nome: 'ExtratoDetalhado.csv', tipo: 'SIMBA', data: '10 Ago 2025 10:00:00', tamanho: '4.2 MB' },
  { id: 2, nome: 'Extrato_2.xlsx', tipo: 'SIMBA', data: '10 Ago 2025 10:00:00', tamanho: '21 KB' },
];

export default function GeneralTab() {
  const router = useRouter();

  const [showNameModal, setShowNameModal] = useState(false);
  const [showSituationModal, setShowSituationModal] = useState(false);
  const [showDeleteCaseModal, setShowDeleteCaseModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRemoveFileModal, setShowRemoveFileModal] = useState<{
    open: boolean;
    index: number | null;
  }>({
    open: false,
    index: null,
  });
  const [showRemoveEnvolvidoModal, setShowRemoveEnvolvidoModal] = useState<{
    open: boolean;
    index: number | null;
  }>({
    open: false,
    index: null,
  });
  const [visualizacaoPermitida, setVisualizacaoPermitida] = useState(true);

  const [novoNome, setNovoNome] = useState('');
  const [novoCpf, setNovoCpf] = useState('');
  const [envolvidos, setEnvolvidos] = useState(envolvidosMock);
  const [arquivos, setArquivos] = useState(arquivosMock);

  const tabs = [
    { label: 'Informações gerais', path: '/casos/ViewCase/generalTab' },
    { label: 'Vínculos', path: '/casos/ViewCase/vinculos' },
    { label: 'Visualização dos dados', path: '/casos/ViewCase/dados' },
  ];

  const handleAddEnvolvido = () => {
    if (novoNome && novoCpf && (novoCpf.length === 11 || novoCpf.length === 14)) {
      const nextId =
        envolvidos.length > 0 ? Math.max(...envolvidos.map((e) => (typeof e.id === 'number' ? e.id : 0))) + 1 : 1;
      setEnvolvidos([...envolvidos, { id: nextId, nome: novoNome, cpf: maskCpfCnpj(novoCpf) }]);
      setNovoNome('');
      setNovoCpf('');
    }
  };

  const handleRemoveEnvolvido = (index: number) => {
    setEnvolvidos(envolvidos.filter((_, i) => i !== index));
    setShowRemoveEnvolvidoModal({ open: false, index: null });
  };

  const handleRemoveArquivo = (index: number) => {
    setArquivos(arquivos.filter((_, i) => i !== index));
    setShowRemoveFileModal({ open: false, index: null });
  };

  const envolvidosColumns: Column<EnvolvidoRow>[] = [
    { key: 'nome', label: 'NOME' },
    { key: 'cpf', label: 'CPF / CNPJ' },
  ];

  const arquivosColumns: Column<ArquivoRow>[] = [
    { key: 'nome', label: 'NOME' },
    { key: 'tipo', label: '' },
    { key: 'data', label: 'DATA DE INCLUSÃO' },
    { key: 'tamanho', label: 'TAMANHO' },
  ];

  const envolvidosRowActions = [
    {
      icon: <TbTrash style={{ color: 'red', fontSize: 20 }} />,
      label: 'Remover',
      onClick: (_row: EnvolvidoRow, _index?: number) => {
        const idx = envolvidos.findIndex((e) => e.id === _row.id);
        setShowRemoveEnvolvidoModal({ open: true, index: idx });
      },
    },
  ];

  const arquivosRowActions = [
    {
      icon: <TbTrash style={{ color: 'red', fontSize: 20 }} />,
      label: 'Remover',
      onClick: (_row: ArquivoRow, _index?: number) => {
        const idx = arquivos.findIndex((e) => e.id === _row.id);
        setShowRemoveFileModal({ open: true, index: idx });
      },
    },
  ];

  function maskCpfCnpj(value: string) {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 11) {
      // CPF: xxx.xxx.xxx-xx
      let cpf = digits.slice(0, 11);
      cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
      cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
      cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      return cpf;
    } else {
      // CNPJ: xx.xxx.xxx/xxxx-xx
      let cnpj = digits.slice(0, 14);
      cnpj = cnpj.replace(/^(\d{2})(\d)/, '$1.$2');
      cnpj = cnpj.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      cnpj = cnpj.replace(/\.(\d{3})(\d)/, '.$1/$2');
      cnpj = cnpj.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
      return cnpj;
    }
  }

  return (
    <div className={styles.pageContainer}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={styles.navTab}
            onClick={() => router.push(tab.path)}
            aria-current={tab.path === '/casos/ViewCase/generalTab' ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className={styles.gridContainer}>
        {/* Detalhes do caso */}
        <div className={styles.caseDetails}>
          <h2>{caseDetails.nome}</h2>
          <div className={styles.detailsRow}>
            <div>
              <strong>Responsável:</strong> {caseDetails.responsavel}
            </div>
            <div>
              <strong>Data de Criação:</strong> {caseDetails.dataCriacao}
            </div>
            <div>
              <strong>Situação:</strong> {caseDetails.situacao}
            </div>
          </div>
          <div className={styles.detailsRow}>
            <div>
              <strong>Data de Atualização:</strong> {caseDetails.dataAtualizacao}
            </div>
            <div>
              <strong>Código do caso:</strong> {caseDetails.codigo}
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className={styles.actionsBox}>
          <div className={styles.sectionHeader}>
            <strong>{'Ações'}</strong>
          </div>

          <Button size="large" label="Alterar nome" variant="contained" onClick={() => setShowNameModal(true)} />
          <Button
            size="large"
            label="Alterar situação"
            variant="contained"
            onClick={() => setShowSituationModal(true)}
          />
          <Button
            size="large"
            label="Permitir visualização"
            variant="contained"
            onClick={() => setVisualizacaoPermitida((v) => !v)}
          />
          <Button size="large" label="Excluir caso" variant="outlined" onClick={() => setShowDeleteCaseModal(true)} />
        </div>

        {/* Envolvidos */}
        <div className={styles.envolvidosBox}>
          <div className={styles.sectionHeader}>
            <strong>
              {'Investigados'} ({envolvidos.length})
            </strong>
          </div>
          <div className={styles.sectionDescription}>
            {'Informe os investigados envolvidos para possibilitar o vínculo com os arquivos anexados.'}
          </div>
          <div className={styles.addEnvolvidoRow}>
            <input
              type="text"
              placeholder="Insira o nome"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              className={styles.input}
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Insira o CPF / CNPJ"
              value={maskCpfCnpj(novoCpf)}
              onChange={(e) => setNovoCpf(e.target.value.replace(/\D/g, ''))}
              className={styles.input}
              maxLength={18} // 14 números + pontuações
            />
            <Button
              icon={<span style={{ fontWeight: 'bold', fontSize: '1.5em' }}>+</span>}
              variant="contained"
              size="small"
              label=""
              onClick={handleAddEnvolvido}
              disabled={!novoNome || !novoCpf || !(novoCpf.length === 11 || novoCpf.length === 14)}
            />
					</div>
					<div className={styles.GenericTable__container}>
						<GenericTable<EnvolvidoRow>
							columns={envolvidosColumns}
							data={envolvidos}
							loading={false}
							rowActions={envolvidosRowActions}
						/>
					</div>
        </div>

        {/* Arquivos */}
        <div className={styles.arquivosBox}>
          <div className={styles.sectionHeader}>
            <strong>
              {'Arquivos'} ({arquivos.length})
            </strong>
          </div>
          <div className={styles.sectionDescription}>
            Os arquivos em anexo serão usados para a geração de vínculos com os investigados.
          </div>
          <Button
            icon={<span style={{ fontSize: '1.2em' }}>📤</span>}
            variant="contained"
            size="small"
            label="Upload"
            onClick={() => setShowUploadModal(true)}
            className={styles.uploadButton}
          />
          <div className={styles.GenericTable_container}>
            <GenericTable<ArquivoRow>
              columns={arquivosColumns}
              data={arquivos as ArquivoRow[]}
              loading={false}
              rowActions={arquivosRowActions}
            ></GenericTable>
          </div>
        </div>
      </div>

      {/* Modais */}
      {showNameModal && (
        <CreateCaseModal
          isOpen={showNameModal}
          onClose={() => setShowNameModal(false)}
          onSubmit={function (_payload: {
            caseName: string;
            caseResponsable: string;
            creationDate: string;
          }): Promise<void> | void {}}
        />
      )}
      {showSituationModal && (
        <Modal
          isOpen={showSituationModal}
          onClose={() => setShowSituationModal(false)}
          title="Alterar situação"
          children={undefined}
        >
          {/* Conteúdo do modal de situação */}
        </Modal>
      )}
      {showDeleteCaseModal && (
        <Modal isOpen={showDeleteCaseModal} onClose={() => setShowDeleteCaseModal(false)} title="Excluir caso">
          <div>
            <p>Ao excluir este caso, todos os vínculos relacionados poderão ser perdidos.</p>
            <Button
              label="Excluir"
              variant="contained"
              onClick={() => {
                /* requisição de exclusão */
              }}
            />
            <Button label="Cancelar" variant="outlined" onClick={() => setShowDeleteCaseModal(false)} />
          </div>
        </Modal>
      )}
      {showRemoveFileModal.open && (
        <Modal
          isOpen={showRemoveFileModal.open}
          onClose={() => setShowRemoveFileModal({ open: false, index: null })}
          title="Remover arquivo?"
        >
          <div>
            <p>Ao excluir este arquivo, todos os vínculos relacionados poderão ser perdidos.</p>
            <Button
              label="Remover"
              variant="contained"
              onClick={() => handleRemoveArquivo(showRemoveFileModal.index!)}
            />
            <Button
              label="Cancelar"
              variant="outlined"
              onClick={() => setShowRemoveFileModal({ open: false, index: null })}
            />
          </div>
        </Modal>
      )}
      {showRemoveEnvolvidoModal.open && (
        <Modal
          isOpen={showRemoveEnvolvidoModal.open}
          onClose={() => setShowRemoveEnvolvidoModal({ open: false, index: null })}
          title="Remover investigado?"
        >
          <div>
            <p>Ao excluir este investigado, todos os vínculos relacionados poderão ser perdidos.</p>
            <Button
              label="Remover"
              variant="contained"
              onClick={() => handleRemoveEnvolvido(showRemoveEnvolvidoModal.index!)}
            />
            <Button
              label="Cancelar"
              variant="outlined"
              onClick={() => setShowRemoveEnvolvidoModal({ open: false, index: null })}
            />
          </div>
        </Modal>
      )}
      {showUploadModal && (
        <Modal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title="Adicionar arquivo"
          children={undefined}
        >
          {/* Conteúdo do modal de upload */}
        </Modal>
      )}
    </div>
  );
}
