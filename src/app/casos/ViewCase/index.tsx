/* eslint-disable max-len */
/* eslint-disable react/no-children-prop */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { FiAlertCircle, FiEdit2, FiUpload } from 'react-icons/fi';
import { TbTrash } from 'react-icons/tb';

import Button from '@/components/Button';
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';
import FilesSection from '@/components/FilesSection';
import GenericTable from '@/components/GenericTable';
import {
  useCaseById,
  useDeleteCase,
  useUpdateCaseCanView,
  useUpdateCaseName,
  useUpdateCaseSituation,
} from '@/hooks/useCase';
import { t } from '@/texts';
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
  {
    id: 1,
    nome: 'ExtratoDetalhado.csv',
    tipo: 'SIMBA',
    data: '10 Ago 2025 10:00:00',
    tamanho: '4.2 MB',
  },
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
        envolvidos.length > 0
          ? Math.max(...envolvidos.map((e) => (typeof e.id === 'number' ? e.id : 0))) + 1
          : 1;
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
    return <div>{'Carregando...'}</div>;
  }
  if (isError || !caseDetails) {
    return <div>{'Erro ao carregar detalhes do caso.'}</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.gridContainer}>
        <div className={styles.caseDetails}>
          <h2>{caseDetails.name}</h2>
          <div className={styles.detailsRow}>
            <div>
              <strong>{t('modal.owner')}</strong> {caseDetails.owner}
            </div>
            <div>
              <strong>{t('modal.creationDate')}</strong> {caseDetails.creation_date}
            </div>
            <div>
              <strong>{t('filter.situation')}</strong> {caseDetails.status}
            </div>
          </div>
          <div className={styles.detailsRow}>
            <div>
              <strong>{t('modal.caseNumber')}</strong> {caseDetails.id}
            </div>
          </div>
        </div>

        <div className={styles.actionsBox}>
          <h1 className={styles.sectionHeader}>
            {t('cases.title.actions', { defaultValue: 'Ações' })}
          </h1>
          <div className={styles.actionsRow}>
            <Button
              size="large"
              label={t('cases.title.changeName', { defaultValue: 'Alterar nome' })}
              variant="contained"
              onClick={() => setShowNameModal(true)}
            />
            <Button
              size="large"
              label={t('cases.title.changeSituation', { defaultValue: 'Alterar situação' })}
              variant="contained"
              onClick={() => setShowSituationModal(true)}
            />
            <Button
              size="large"
              label={t('cases.title.allowView', { defaultValue: 'Permitir visualização' })}
              variant="contained"
              onClick={handleToggleCanView}
            />
            <Button
              size="large"
              label={t('cases.title.delete', { defaultValue: 'Excluir caso' })}
              variant="outlined"
              onClick={() => setShowDeleteCaseModal(true)}
            />
          </div>
        </div>

        <div className={styles.envolvidosBox}>
          <div className={styles.sectionHeader}>
            <strong>
              {t('cases.title.investigated', { defaultValue: 'Investigados' })} ({envolvidos.length}
              )
            </strong>
          </div>
          <div className={styles.sectionDescription}>
            {t('cases.title.investigatedDesc', {
              defaultValue:
                'Informe os investigados envolvidos para possibilitar o vínculo com os arquivos anexados.',
            })}
          </div>
          <div className={styles.addEnvolvidoRow}>
            <input
              type="text"
              placeholder={t('cases.title.inputName', { defaultValue: 'Insira o nome' })}
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              className={styles.input}
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={t('cases.title.inputCpfCnpj', { defaultValue: 'Insira o CPF / CNPJ' })}
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
              disabled={!novoNome || !novoCpf || !(novoCpf.length === 11 || novoCpf.length === 14)}
            />
          </div>
          <div className={styles.GenericTable__container}>
            <GenericTable<EnvolvidoRow>
              columns={envolvidosColumns}
              data={envolvidos}
              loading={false}
              rowActions={envolvidosRowActions}
              variant={'outlined'}
            />
          </div>
        </div>
        <div className={styles.arquivosBox}>
          <FilesSection caseId={caseId} />
        </div>
      </div>

      {showNameModal && (
        <ConfirmationModal
          isOpen={showNameModal}
          onClose={() => setShowNameModal(false)}
          icon={<FiEdit2 size={36} color="#ff3636" />}
          title={t('cases.title.changeName', { defaultValue: 'Alterar nome do caso' })}
          description={t('cases.title.changeNameDesc', {
            defaultValue: 'Altere o nome do caso abaixo.',
          })}
          primaryLabel={t('cases.title.save', { defaultValue: 'Salvar' })}
          onPrimary={handleUpdateName}
          secondaryLabel={t('cases.title.cancel', { defaultValue: 'Cancelar' })}
          onSecondary={() => setShowNameModal(false)}
        >
          <input
            type="text"
            value={novoNomeCaso}
            onChange={(e) => setNovoNomeCaso(e.target.value)}
            className={styles.input}
            style={{ marginBottom: 16, marginTop: 8, width: '100%' }}
            placeholder={t('cases.title.inputName', { defaultValue: 'Novo nome do caso' })}
          />
        </ConfirmationModal>
      )}

      {showSituationModal && (
        <ConfirmationModal
          isOpen={showSituationModal}
          onClose={() => setShowSituationModal(false)}
          icon={<FiEdit2 size={36} color="#ff3636" />}
          title={t('cases.title.changeSituation', { defaultValue: 'Alterar situação' })}
          description={t('cases.title.changeSituationDesc', {
            defaultValue: 'Selecione a nova situação do caso.',
          })}
          primaryLabel={t('cases.title.save', { defaultValue: 'Salvar' })}
          onPrimary={handleUpdateSituation}
          secondaryLabel={t('cases.title.cancel', { defaultValue: 'Cancelar' })}
          onSecondary={() => setShowSituationModal(false)}
        >
          <select
            value={novaSituacao}
            onChange={(e) => setNovaSituacao(e.target.value as CaseItem['status'])}
            className={styles.input}
            style={{ marginBottom: 16, marginTop: 8, width: '100%' }}
          >
            <option value="">
              {t('cases.title.selectSituation', { defaultValue: 'Selecione a situação' })}
            </option>
            <option value="Em andamento">
              {t('cases.title.situationOngoing', { defaultValue: 'Em andamento' })}
            </option>
            <option value="Suspenso">
              {t('cases.title.situationSuspended', { defaultValue: 'Suspenso' })}
            </option>
            <option value="Encerrado">
              {t('cases.title.situationClosed', { defaultValue: 'Encerrado' })}
            </option>
          </select>
        </ConfirmationModal>
      )}

      {showDeleteCaseModal && (
        <ConfirmationModal
          isOpen={showDeleteCaseModal}
          onClose={() => setShowDeleteCaseModal(false)}
          icon={<TbTrash size={36} color="#ff3636" />}
          title={t('cases.title.delete', { defaultValue: 'Excluir caso?' })}
          description={t('cases.title.deleteWarning', {
            defaultValue:
              'Ao excluir este caso, todos os vínculos relacionados poderão ser perdidos.',
          })}
          primaryLabel={t('cases.title.delete', { defaultValue: 'Excluir' })}
          onPrimary={handleDeleteCase}
          secondaryLabel={t('cases.title.cancel', { defaultValue: 'Cancelar' })}
          onSecondary={() => setShowDeleteCaseModal(false)}
        />
      )}

      {showRemoveFileModal.open && (
        <ConfirmationModal
          isOpen={showRemoveFileModal.open}
          onClose={() => setShowRemoveFileModal({ open: false, index: null })}
          icon={<FiAlertCircle size={36} color="#ff3636" />}
          title={t('cases.title.removeFile', { defaultValue: 'Remover arquivo?' })}
          description={t('cases.title.removeFileWarning', {
            defaultValue:
              'Ao excluir este arquivo, todos os vínculos relacionados poderão ser perdidos.',
          })}
          primaryLabel={t('cases.title.remove', { defaultValue: 'Remover' })}
          onPrimary={() => handleRemoveArquivo(showRemoveFileModal.index!)}
          secondaryLabel={t('cases.title.cancel', { defaultValue: 'Cancelar' })}
          onSecondary={() => setShowRemoveFileModal({ open: false, index: null })}
        />
      )}

      {showRemoveEnvolvidoModal.open && (
        <ConfirmationModal
          isOpen={showRemoveEnvolvidoModal.open}
          onClose={() => setShowRemoveEnvolvidoModal({ open: false, index: null })}
          icon={<FiAlertCircle size={36} color="#ff3636" />}
          title={t('cases.title.removeInvestigated', { defaultValue: 'Remover investigado?' })}
          description={t('cases.title.removeInvestigatedWarning', {
            defaultValue:
              'Ao excluir este investigado, todos os vínculos relacionados poderão ser perdidos.',
          })}
          primaryLabel={t('cases.title.remove', { defaultValue: 'Remover' })}
          onPrimary={() => handleRemoveEnvolvido(showRemoveEnvolvidoModal.index!)}
          secondaryLabel={t('cases.title.cancel', { defaultValue: 'Cancelar' })}
          onSecondary={() => setShowRemoveEnvolvidoModal({ open: false, index: null })}
        />
      )}

      {showUploadModal && (
        <ConfirmationModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          icon={<FiUpload size={36} color="#ff3636" />}
          title={t('cases.title.addFile', { defaultValue: 'Adicionar arquivo' })}
          description={t('cases.title.addFileDesc', {
            defaultValue: 'Selecione um arquivo para anexar ao caso.',
          })}
          primaryLabel={t('cases.title.save', { defaultValue: 'Salvar' })}
          onPrimary={() => setShowUploadModal(false)}
          secondaryLabel={t('cases.title.cancel', { defaultValue: 'Cancelar' })}
          onSecondary={() => setShowUploadModal(false)}
        ></ConfirmationModal>
      )}
    </div>
  );
}
