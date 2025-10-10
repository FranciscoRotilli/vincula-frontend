'use client';
import { CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import React, { use, useEffect, useState } from 'react';
import { BiSolidError } from 'react-icons/bi';
import { FiAlertCircle, FiEdit2, FiUpload, FiUserPlus } from 'react-icons/fi';
import { TbTrash } from 'react-icons/tb';

import Button from '@/components/Button';
import { CaseContainer } from '@/components/CaseContainer';
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
import { useAddSuspect } from '@/hooks/useSuspect';
import { t } from '@/texts';
import { CaseItem, SuspectInput } from '@/types/Cases';
import { File } from '@/types/Files';
import { Column } from '@/types/Table';
import { maskCpfCnpj } from '@/utils/functions';

import styles from './page.module.css';
import AllowVisualizationModal from '@/components/AllowVisualizationModal/AllowVisualizationModal';

type EnvolvidoRow = { id: string | number; name: string; cpf_cnpj: string; phone_number?: string };

export default function GeneralInfoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const caseId = id;
  const [showNameModal, setShowNameModal] = useState(false);
  const [showSituationModal, setShowSituationModal] = useState(false);
  const [showDeleteCaseModal, setShowDeleteCaseModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAllowVisualizationModal, setShowAllowVisualizationModal] = useState(false);
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
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoCpf, setNovoCpf] = useState('');

  const updateNameMutation = useUpdateCaseName();
  const updateSituationMutation = useUpdateCaseSituation();
  const updateCanViewMutation = useUpdateCaseCanView();
  const deleteCaseMutation = useDeleteCase();

  const { data: caseDetails, isLoading, isError, refetch } = useCaseById(caseId);

  const addSuspectMutation = useAddSuspect();

  const [envolvidos, setEnvolvidos] = useState<EnvolvidoRow[]>([]);
  const [arquivos, setArquivos] = useState<File[]>([]);
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
        onError: (error) => {
          console.error('Failed to update case situation:', error);
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
    const newSuspect: SuspectInput = {
      name: novoNome,
      cpf_cnpj: novoCpf,
      phone_number: novoTelefone,
    };

    addSuspectMutation.mutate(
      { caseId, newSuspect },
      {
        onSuccess: () => {
          setNovoNome('');
          setNovoCpf('');
          setNovoTelefone('');

          refetch();
        },
      }
    );
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
    { key: 'name', label: 'NOME' },
    { key: 'cpf_cnpj', label: 'CPF / CNPJ' },
    { key: 'phone_number', label: 'Telefone' },
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

  useEffect(() => {
    if (caseDetails) {
      setEnvolvidos(caseDetails.suspects || []);
      setArquivos(caseDetails.archives || []);
    }
  }, [caseDetails]);

  if (isLoading) {
    return (
      <div className={styles.loadingOrErrorContainer}>
        <CircularProgress size={40} />
      </div>
    );
  }
  if (isError || !caseDetails) {
    return (
      <div className={styles.loadingOrErrorContainer}>
        <div className={styles.errorContent}>
          <BiSolidError size={60} className={styles.errorIcon} />
          <span>{t('cases.errorMessage')}</span>
          <div className={styles.errorButtons}>
            <Button
              size="medium"
              label={t('cases.returnToCases')}
              variant="error"
              className={styles.returnButton}
              onClick={() => router.push('/casos')}
            />
            <Button
              size="medium"
              label={t('cases.reload')}
              className={styles.reloadButton}
              onClick={() => refetch()}
            />
          </div>
        </div>
      </div>
    );
  }
  return (
    <CaseContainer caseId={id}>
      <div className={styles.pageContainer}>
        <div className={styles.gridContainer}>
          <div className={styles.caseDetails} data-testid="case-details">
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
                <strong>{t('modal.caseNumber')}</strong> #{caseDetails.case_number}
              </div>
            </div>
          </div>

          <div className={styles.actionsBox} data-testid="case-actions">
            <h1 className={styles.sectionHeader}>
              {t('cases.title.actions', { defaultValue: 'Ações' })}
            </h1>
            <div className={styles.actionsRow}>
              <Button
                size="small"
                label={t('cases.title.changeName', { defaultValue: 'Alterar nome' })}
                variant="contained"
                onClick={() => setShowNameModal(true)}
              />
              <Button
                size="small"
                label={t('cases.title.changeSituation', { defaultValue: 'Alterar situação' })}
                variant="contained"
                onClick={() => setShowSituationModal(true)}
              />
              <Button
                size="small"
                label={t('cases.title.allowView', { defaultValue: 'Permitir visualização' })}
                variant="contained"
                onClick={() => {
                  setShowAllowVisualizationModal(true);
                }}
              />
              <Button
                size="small"
                label={t('cases.title.delete', { defaultValue: 'Excluir caso' })}
                variant="outlined"
                onClick={() => setShowDeleteCaseModal(true)}
              />
            </div>
          </div>

          <div className={styles.envolvidosBox} data-testid="case-involved">
            <div className={styles.sectionHeader}>
              <strong>
                {t('cases.title.investigated', { defaultValue: 'Investigados' })} (
                {envolvidos.length})
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
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={t('cases.title.inputPhone', { defaultValue: 'Insira o telefone' })}
                value={novoTelefone}
                onChange={(e) => setNovoTelefone(e.target.value.replace(/\D/g, ''))}
                className={styles.input}
                maxLength={15}
              />
              <Button
                icon={<span style={{ fontWeight: 'bold', fontSize: '1.5em' }}>+</span>}
                variant="contained"
                size="small"
                label=""
                onClick={handleAddEnvolvido}
                disabled={
                  !novoNome || !novoCpf || !(novoCpf.length === 11 || novoCpf.length === 14)
                }
              />
            </div>
            <div className={styles.GenericTable__container}>
              <GenericTable<EnvolvidoRow>
                columns={envolvidosColumns}
                data={envolvidos}
                loading={isLoading}
                rowActions={envolvidosRowActions}
                variant={'outlined'}
              />
            </div>
          </div>
          <div className={styles.arquivosBox} data-testid="case-files">
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

        {showAllowVisualizationModal && (
          <AllowVisualizationModal
            isOpen={showAllowVisualizationModal}
            onClose={() => setShowAllowVisualizationModal(false)}
            icon={<FiUserPlus size={36} color="#ff3636" />}
            title={t('cases.title.allowView', { defaultValue: 'Permitir visualização' })}
            description={t('cases.title.allowViewDesc', {
              defaultValue: 'Selecione um usuário para compartilhar o acesso ao caso.',
            })}
            primaryLabel={t('cases.title.save', { defaultValue: 'Salvar' })}
            onPrimary={() => {
              setShowAllowVisualizationModal(false);
              window.location.reload();
            }}
            caseId={id}
            secondaryLabel={t('cases.title.cancel', { defaultValue: 'Cancelar' })}
            onSecondary={() => setShowAllowVisualizationModal(false)}
          />
        )}
      </div>
    </CaseContainer>
  );
}
