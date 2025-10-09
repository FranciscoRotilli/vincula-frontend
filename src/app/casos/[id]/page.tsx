'use client';
import AddIcon from '@mui/icons-material/Add';
import { CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import React, { use, useEffect, useState } from 'react';
import { BiSolidError } from 'react-icons/bi';
import { FiAlertCircle, FiEdit2, FiUpload } from 'react-icons/fi';
import { TbTrash } from 'react-icons/tb';

import Button from '@/components/Button';
import { CaseContainer } from '@/components/CaseContainer';
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';
import FilesSection from '@/components/FilesSection';
import GenericTable from '@/components/GenericTable';
import Input from '@/components/Input';
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

type EnvolvidoRow = { id: string | number; name: string; cpf_cnpj: string; phone_number?: string };

export default function GeneralInfoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const caseId = id;
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
            <h2 className={styles.h2} data-testid='case-name'>{caseDetails.name}</h2>
            <div className={styles.detailsRow} data-testid="case-informations">
              <div>
                <strong>{t('modal.owner')}</strong> {caseDetails.owner}
              </div>
              <div>
                <strong>{t('modal.caseNumber')}</strong> #{caseDetails.case_number}
              </div>
              <div>
                <strong>{t('modal.status')}</strong> {caseDetails.status}
              </div>
              <div>
                <strong>{t('modal.creationDate')}</strong> {caseDetails.creation_date}
              </div>
            </div>
          </div>

          <div className={styles.actionsBox} data-testid="case-action-buttons">
            <h1 className={styles.title3}>
              {t('cases.title.actions')}
            </h1>
            <div className={styles.actionsRow}>
              <Button
                size="medium"
                label={t('cases.title.changeName')}
                variant="contained"
                onClick={() => setShowNameModal(true)}
              />
              <Button
                size="medium"
                label={t('cases.title.changeSituation')}
                variant="contained"
                onClick={() => setShowSituationModal(true)}
              />
              <Button
                size="medium"
                label={t('cases.title.allowView')}
                variant="contained"
                onClick={handleToggleCanView}
              />
              <Button
                size="medium"
                label={t('cases.title.delete')}
                variant="outlined"
                onClick={() => setShowDeleteCaseModal(true)}
              />
            </div>
          </div>

          <div className={styles.investigatedSection} data-testid="investigated-section">
            <div className={styles.sectionHeader}>
              <h1 className={styles.title3}>
                {t('cases.title.investigated', { defaultValue: 'Investigados' })} (
                {envolvidos.length})
              </h1>
              <p className={styles.body5}>
              {t('cases.title.investigatedDesc', {
                defaultValue:
                  'Informe os investigados envolvidos para possibilitar o vínculo com os arquivos anexados.',
              })}
              </p>
            <div className={styles.addInvestigated} data-testid="add-investigated">
              <Input
                placeholder={t('cases.title.inputName')}
                label='Nome'
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                className={styles.input}
              />
              <Input
                inputMode="numeric"
                label='CPF / CNPJ'
                //pattern="[0-9]*"
                placeholder={t('cases.title.inputCpfCnpj')}
                value={maskCpfCnpj(novoCpf)}
                onChange={(e) => setNovoCpf(e.target.value.replace(/\D/g, ''))}
                className={styles.input}
                //maxLength={18}
              />
              <Input
                inputMode="numeric"
                label='Telefone'
                //pattern="[0-9]*"
                placeholder={t('cases.title.inputPhone', { defaultValue: 'Insira o telefone' })}
                value={novoTelefone}
                onChange={(e) => setNovoTelefone(e.target.value.replace(/\D/g, ''))}
                className={styles.input}
                //maxLength={15}
              />
              <Button
                icon={<AddIcon />}
                variant="contained"
                size="icon"
                label=""
                onClick={handleAddEnvolvido}
                disabled={
                  !novoNome || !novoCpf || !(novoCpf.length === 11 || novoCpf.length === 14)
                }
              />
            </div>
            </div>
            <div className={styles.GenericTable__container} data-testid="involved-table">
              <GenericTable<EnvolvidoRow>
                columns={envolvidosColumns}
                data={envolvidos}
                loading={isLoading}
                rowActions={envolvidosRowActions}
                variant={'outlined'}
              />
            </div>
          </div>
          <div className={styles.filesSection} data-testid="files-section">
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
    </CaseContainer>
  );
}
