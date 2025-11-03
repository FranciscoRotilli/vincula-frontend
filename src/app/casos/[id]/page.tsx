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
import AllowVisualizationModal from '@/components/Modals/AllowVisualizationModal';
import {
  useAllowVisualization,
  useCaseById,
  useDeleteCase,
  useUpdateCaseName,
  useUpdateCaseSituation,
} from '@/hooks/useCase';
import { useAddSuspect, useDeleteSuspect } from '@/hooks/useSuspect';
import { t } from '@/texts';
import { CaseItem, SuspectRequest } from '@/types/Cases';
import { FileResponse } from '@/types/Files';
import { Column } from '@/types/Table';
import { maskCpfCnpj } from '@/utils/functions';

import styles from './page.module.css';

type SuspectRow = { id: string | number; name: string; cpf_cnpj: string; phone_number?: string };

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
  const [showRemoveSuspectModal, setShowRemoveSuspectModal] = useState<{
    open: boolean;
    index: number | null;
  }>({
    open: false,
    index: null,
  });

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCpf, setNewCpf] = useState('');

  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    cpf_cnpj?: string;
  }>({});

  const updateNameMutation = useUpdateCaseName();
  const updateSituationMutation = useUpdateCaseSituation();
  const deleteCaseMutation = useDeleteCase();
  const allowViewMutation = useAllowVisualization();

  const { data: caseDetails, isLoading, isError, refetch } = useCaseById(caseId);

  const addSuspectMutation = useAddSuspect();
  const deleteSuspectMutation = useDeleteSuspect();

  const [suspects, setSuspects] = useState<SuspectRow[]>([]);
  const [files, setFiles] = useState<FileResponse[]>([]);
  const [newCaseName, setNewCaseName] = useState('');
  const [newSituation, setNewSituation] = useState('');
  const [selectedUser] = useState('');

  const handleUpdateName = async () => {
    updateNameMutation.mutate(
      { caseId, name: newCaseName as CaseItem['name'] },
      {
        onSuccess: () => {
          setShowNameModal(false);
        },
        onError: (error) => {
          console.error('Failed to update case name: ', error);
        }
      }
    );
  };

  const handleUpdateSituation = async () => {
    updateSituationMutation.mutate(
      { caseId, situation: newSituation as CaseItem['status'] },
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

  const handleDeleteCase = () => {
    deleteCaseMutation.mutate(caseId, {
      onSuccess: () => {
        setShowDeleteCaseModal(false);
        router.push('/casos');
      },
      onError: (error) => {
        console.error('Failed to delete case:', error);
      }
    });
  };

  const handleAddSuspect = () => {
    const errors: typeof validationErrors = {};
    let isValid = true;

    const rawCpfCnpj = newCpf.replace(/\D/g, '');

    if (!newName.trim()) {
      errors.name = 'O nome é obrigatório.';
      isValid = false;
    }
    if (!rawCpfCnpj) {
      errors.cpf_cnpj = 'CPF/CNPJ é obrigatório.';
      isValid = false;
    } else if (rawCpfCnpj.length !== 11 && rawCpfCnpj.length !== 14) {
      errors.cpf_cnpj = 'CPF/CNPJ inválido.';
      isValid = false;
    }

    setValidationErrors(errors);

    if (!isValid) {
      return;
    }

    setValidationErrors({});

    const newSuspect: SuspectRequest = {
      name: newName,
      cpf_cnpj: rawCpfCnpj,
      phone_number: newPhone,
    };

    addSuspectMutation.mutate(
      { caseId, newSuspect },
      {
        onSuccess: () => {
          setNewName('');
          setNewCpf('');
          setNewPhone('');
          refetch();
        },
        onError: (error) => {
          console.error('Falha na API ao adicionar investigado:', error);
        }
      }
    );
  };

  const handleAllowVisualization = () => {
    allowViewMutation.mutate({ caseId, userId: selectedUser }, {
      onSuccess: () => {
        setShowAllowVisualizationModal(false);
        window.location.reload()
      }
    });
  }

  const handleRemoveSuspect = (index: number) => {
    if (index === null || index === undefined) return;
    const suspect = suspects[index];

    deleteSuspectMutation.mutate(
      { caseId, suspectId: suspect.id.toString() },
      {
        onSuccess: () => {
          setSuspects((prev) => prev.filter((_, i) => i !== index));
          setShowRemoveSuspectModal({ open: false, index: null });
          refetch();
        },
        onError: (error) => {
          console.error('Erro ao remover investigado:', error);
        },
      }
    );
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setShowRemoveFileModal({ open: false, index: null });
  };

  const suspectsColumns: Column<SuspectRow>[] = [
    { key: 'name', label: 'NOME' },
    { key: 'cpf_cnpj', label: 'CPF / CNPJ' },
    { key: 'phone_number', label: 'TELEFONE' },
  ];

  const suspectsRowActions = [
    {
      icon: <TbTrash style={{ color: 'red', fontSize: 20 }} />,
      label: 'Remover',
      onClick: (_row: SuspectRow, _index?: number) => {
        const idx = suspects.findIndex((e) => e.id === _row.id);
        setShowRemoveSuspectModal({ open: true, index: idx });
      },
    },
  ];

  useEffect(() => {
    if (caseDetails) {
      setSuspects(caseDetails.suspects || []);
      setFiles(caseDetails.archives || []);
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
                onClick={() => {
                  setShowAllowVisualizationModal(true);
                }}
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
                {suspects.length})
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
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={styles.input}
                  error={validationErrors.name}
                />
                <Input
                  inputMode="numeric"
                  label='CPF / CNPJ'
                  placeholder={t('cases.title.inputCpfCnpj')}
                  value={maskCpfCnpj(newCpf)}
                  onChange={(e) => setNewCpf(e.target.value.replace(/\D/g, ''))}
                  className={styles.input}
                  error={validationErrors.cpf_cnpj}
                />
                <Input
                  inputMode="numeric"
                  label='Telefone'
                  placeholder={t('cases.title.inputPhone', { defaultValue: 'Insira o telefone' })}
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                  className={styles.input}
                />
                <Button
                  icon={<AddIcon />}
                  variant="contained"
                  size="icon"
                  label=""
                  onClick={handleAddSuspect}
                />
              </div>
            </div>
            <div className={styles.GenericTable__container} data-testid="involved-table">
              <GenericTable<SuspectRow>
                columns={suspectsColumns}
                data={suspects}
                loading={isLoading}
                rowActions={suspectsRowActions}
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
              value={newCaseName}
              onChange={(e) => setNewCaseName(e.target.value as CaseItem['name'])}
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
              value={newSituation}
              onChange={(e) => setNewSituation(e.target.value as CaseItem['status'])}
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
            onPrimary={() => handleRemoveFile(showRemoveFileModal.index!)}
            secondaryLabel={t('cases.title.cancel', { defaultValue: 'Cancelar' })}
            onSecondary={() => setShowRemoveFileModal({ open: false, index: null })}
          />
        )}

        {showRemoveSuspectModal.open && (
          <ConfirmationModal
            isOpen={showRemoveSuspectModal.open}
            onClose={() => setShowRemoveSuspectModal({ open: false, index: null })}
            icon={<FiAlertCircle size={36} color="#ff3636" />}
            title={t('cases.title.removeInvestigated', { defaultValue: 'Remover investigado?' })}
            description={t('cases.title.removeInvestigatedWarning', {
              defaultValue:
                'Ao excluir este investigado, todos os vínculos relacionados poderão ser perdidos.',
            })}
            primaryLabel={t('cases.title.remove', { defaultValue: 'Remover' })}
            onPrimary={() => handleRemoveSuspect(showRemoveSuspectModal.index!)}
            secondaryLabel={t('cases.title.cancel', { defaultValue: 'Cancelar' })}
            onSecondary={() => setShowRemoveSuspectModal({ open: false, index: null })}
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
            caseId={id}
            onSubmit={() => handleAllowVisualization()}
          />
        )}
      </div>
    </CaseContainer>
  );
}
