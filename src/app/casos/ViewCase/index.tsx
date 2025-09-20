/* eslint-disable react/no-children-prop */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { FiUpload } from 'react-icons/fi';
import { TbTrash } from 'react-icons/tb';

import Button from '@/components/Button';
import { CaseContainer } from '@/components/CaseContainer';
import GenericTable from '@/components/GenericTable';
import Modal from '@/components/Modals';
import CreateCaseModal from '@/components/Modals/CreateCaseModal';
import {
  useCaseById,
  useDeleteCase,
  useUpdateCaseCanView,
  useUpdateCaseName,
  useUpdateCaseSituation,
} from '@/hooks/useCase';
import { CaseItem } from '@/types/Cases';
import { Column } from '@/types/Table';

import styles from './generalTab.module.css';

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

export default function GeneralTab({ caseId }: Readonly<{ caseId: string }>) {
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

  const updateNameMutation = useUpdateCaseName();
  const updateSituationMutation = useUpdateCaseSituation();
  const updateCanViewMutation = useUpdateCaseCanView();
  const deleteCaseMutation = useDeleteCase();

  const { data: caseDetails, isLoading, isError } = useCaseById(caseId);

  const [novoNomeCaso, setNovoNomeCaso] = useState('');
  const [novaSituacao, setNovaSituacao] = useState('');

  const handleUpdateName = async () => {
    updateNameMutation.mutate(
      { caseId, name: novoNomeCaso },
      {
        onSuccess: () => {
          setShowNameModal(false);
        },
      }
    );
  };

  const handleUpdateSituation = async () => {
    updateSituationMutation.mutate(
      { caseId, situation: novaSituacao as CaseItem['status'] },
      {
        onSuccess: () => {
          setShowSituationModal(false);
        },
      }
    );
  };

  const handleToggleCanView = () => {
    updateCanViewMutation.mutate(
      { caseId, canView: !visualizacaoPermitida },
      {
        onSuccess: () => {
          setVisualizacaoPermitida((v) => !v);
        },
      }
    );
  };

  const handleDeleteCase = () => {
    deleteCaseMutation.mutate(caseId, {
      onSuccess: () => {
        setShowDeleteCaseModal(false);
      },
    });
  };

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

  if (isLoading) {
    return <div>{"Carregando..."}</div>;
  }
  if (isError || !caseDetails) {
    return <div>{"Erro ao carregar detalhes do caso."}</div>;
  }

  return (
    <CaseContainer caseId={caseId}>
      <div className={styles.pageContainer}>
        <div className={styles.gridContainer}>
          <div className={styles.caseDetails}>
            <h2>{caseDetails.name}</h2>
            <div className={styles.detailsRow}>
              <div>
                <strong>{'Responsável:'}</strong> {caseDetails.owner}
              </div>
              <div>
                <strong>{'Data de Criação:'}</strong> {caseDetails.creation_date}
              </div>
              <div>
                <strong>{'Situação:'}</strong> {caseDetails.status}
              </div>
            </div>
            <div className={styles.detailsRow}>
              <div>
                <strong>{'Código do caso:'}</strong> {caseDetails.id}
              </div>
            </div>
          </div>

          <div className={styles.actionsBox}>
            <h1 className={styles.sectionHeader}>
              <text>{'Ações'}</text>
            </h1>
            <div className={styles.actionsRow}>
              <Button
                size="large"
                label="Alterar nome"
                variant="contained"
                onClick={() => setShowNameModal(true)}
              />
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
                onClick={handleToggleCanView}
              />
              <Button
                size="large"
                label="Excluir caso"
                variant="outlined"
                onClick={() => setShowDeleteCaseModal(true)}
              />
            </div>
          </div>

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
                maxLength={18}
              />
              <Button
                icon={<span style={{ fontWeight: 'bold', fontSize: '1.5em' }}>+</span>}
                variant="contained"
                size="small"
                label=""
                onClick={handleAddEnvolvido}
                disabled={
                  !novoNome ||
                  !novoCpf ||
                  !(novoCpf.length === 11 || novoCpf.length === 14)
                }
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

          <div className={styles.arquivosBox}>
            <div className={styles.sectionHeader}>
              <strong>
                {'Arquivos'} ({arquivos.length})
              </strong>
            </div>
            <div className={styles.sectionDescription}>
              {'Os arquivos em anexo serão usados para a geração de vínculos com os investigados.'}
            </div>
            <Button
              icon={<FiUpload />}
              variant="contained"
              size="small"
              label="Upload"
              onClick={() => setShowUploadModal(true)}
              className={styles.uploadButton}
            />
            <div className={styles.GenericTable__container}>
              <GenericTable<ArquivoRow>
                columns={arquivosColumns}
                data={arquivos as ArquivoRow[]}
                loading={false}
                rowActions={arquivosRowActions}
              ></GenericTable>
            </div>
          </div>
        </div>

        {showNameModal && (
          <CreateCaseModal
            isOpen={showNameModal}
            onClose={() => setShowNameModal(false)}
            onSubmit={async ({ caseName }) => {
              setNovoNomeCaso(caseName);
              handleUpdateName();
            }}
          />
        )}
        {showSituationModal && (
          <Modal
            isOpen={showSituationModal}
            onClose={() => setShowSituationModal(false)}
            title="Alterar situação"
          >
            <select
              value={novaSituacao}
              onChange={(e) => setNovaSituacao(e.target.value as CaseItem['status'])}
              className={styles.input}
            >
              <option value="">{"Selecione a situação"}</option>
              <option value="Em andamento">{"Em andamento"}</option>
              <option value="Suspenso">{"Suspenso"}</option>
              <option value="Encerrado">{"Encerrado"}</option>
            </select>
            <Button
              label="Salvar"
              variant="contained"
              onClick={handleUpdateSituation}
              disabled={!novaSituacao}
            />
            <Button
              label="Cancelar"
              variant="outlined"
              onClick={() => setShowSituationModal(false)}
            />
          </Modal>
        )}
        {showDeleteCaseModal && (
          <Modal isOpen={showDeleteCaseModal} onClose={() => setShowDeleteCaseModal(false)} title="Excluir caso">
            <div>
              <p>{'Ao excluir este caso, todos os vínculos relacionados poderão ser perdidos.'}</p>
              <Button
                label="Excluir"
                variant="contained"
                onClick={handleDeleteCase}
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
              <p>{'Ao excluir este arquivo, todos os vínculos relacionados poderão ser perdidos.'}</p>
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
              <p>{'Ao excluir este investigado, todos os vínculos relacionados poderão ser perdidos.'}</p>
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
          </Modal>
        )}
      </div>
    </CaseContainer>
  );
}
