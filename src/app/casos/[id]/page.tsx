'use client';
import { MoreVert } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import { CircularProgress, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { useRouter } from 'next/navigation';
import React, { use, useEffect, useState } from 'react';
import { BiSolidError } from 'react-icons/bi';
import { FiAlertCircle, FiEdit2, FiUpload } from 'react-icons/fi';
import { TbTrash } from 'react-icons/tb';
import { toast } from 'react-toastify';

import Button from '@/components/Button';
import { CaseContainer } from '@/components/CaseContainer';
import FilesSection from '@/components/FilesSection';
import GenericTable from '@/components/GenericTable';
import Input from '@/components/Input';
import ListPeople from '@/components/ListPeople';
import AddSuspectsBatchModal from '@/components/Modals/AddSuspectsBatchModal';
import AllowVisualizationModal from '@/components/Modals/AllowVisualizationModal';
import ChangeOwnerModal from '@/components/Modals/ChangeOwnerModal';
import ConfirmationModal from '@/components/Modals/ConfirmationModal';
import RemoveModal from '@/components/Modals/RemoveModal';
import {
  useAllowVisualization,
  useCaseById,
  useDeleteCase,
  useRemoveUserAccess,
  useUpdateCaseName,
  useUpdateCaseOwner,
  useUpdateCaseSituation,
  useUsersWithAccess,
} from '@/hooks/useCase';
import { useAddSuspect, useAddSuspectsBatch, useDeleteSuspect } from '@/hooks/useSuspect';
import { useUsers } from '@/hooks/useUsers';
import { getCurrentUser } from '@/services/auth';
import { t } from '@/texts';
import { CaseItem, SuspectRequest } from '@/types/Cases';
import { FileResponse } from '@/types/Files';
import { Column } from '@/types/Table';
import { CurrentUser } from '@/types/User';
import { maskCpfCnpj } from '@/utils/functions';

import styles from './page.module.css';

type SuspectRow = { id: string | number; name: string; cpf_cnpj: string; phone_number?: string };

export default function GeneralInfoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const caseId = id;
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Erro ao buscar usuário atual:', error);
      }
    }
    fetchCurrentUser();
  }, []);
  const isAdmin = currentUser?.role === 'ADMIN';

  const [showNameModal, setShowNameModal] = useState(false);
  const [showSituationModal, setShowSituationModal] = useState(false);
  const [showDeleteCaseModal, setShowDeleteCaseModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAllowVisualizationModal, setShowAllowVisualizationModal] = useState(false);
  const [showChangeResponsibleModal, setShowChangeResponsibleModal] = useState(false);
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
  const [showAddSuspectsBatchModal, setShowAddSuspectsBatchModal] = useState(false);
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
  const updateOwnerMutation = useUpdateCaseOwner();
  const removeUserMutation = useRemoveUserAccess();

  const { data: caseDetails, isLoading, isError, refetch } = useCaseById(caseId);
  const { data: users, isLoading: isLoadingUsers } = useUsers();
  const { data: usersWithAccess = [] } = useUsersWithAccess(caseId);

  const addSuspectMutation = useAddSuspect();
  const deleteSuspectMutation = useDeleteSuspect();
  const addSuspectsBatchMutation = useAddSuspectsBatch();

  const [suspects, setSuspects] = useState<SuspectRow[]>([]);
  const [files, setFiles] = useState<FileResponse[]>([]);
  const [newCaseName, setNewCaseName] = useState('');
  const [newSituation, setNewSituation] = useState('');

  const handleUpdateName = async () => {
    if (updateNameMutation.isPending) return;
    updateNameMutation.mutate(
      { caseId, name: newCaseName as CaseItem['name'] },
      {
        onSuccess: () => {
          setShowNameModal(false);
          toast.success(t('toastSuccess.handleUpdateName'))
        },
        onError: (error) => {
          toast.error(t('toastError.handleUpdateName'))
          console.error('Failed to update case situation:', error);
        },
      }
    );
  };

  const handleUpdateOwner = async (userId: string) => {
    updateOwnerMutation.mutate(
      { caseId, userId },
      {
        onSuccess: () => {
          setShowChangeResponsibleModal(false);
          refetch(); 
        },
        onError: (error) => {
          console.error('Failed to update case owner:', error);
        },
      }
    );
  };

  const handleUpdateSituation = async () => {
    if (updateSituationMutation.isPending) return;
    updateSituationMutation.mutate(
      { caseId, situation: newSituation as CaseItem['status'] },
      {
        onSuccess: () => {
          setShowSituationModal(false);
          toast.success(t('toastSuccess.handleUpdateSituation'))
        },
        onError: (error) => {
          toast.error(t('toastError.handleUpdateSituation'))
          console.error('Failed to update case situation:', error);
        },
      }
    );
  };

  const handleDeleteCase = () => {
    if (deleteCaseMutation.isPending) return;
    deleteCaseMutation.mutate(caseId, {
      onSuccess: () => {
        setShowDeleteCaseModal(false);
        toast.success(t('toastSuccess.handleDeleteCase'))
        router.push('/casos');
      },
      onError: (error) => {
          toast.error(t('toastError.handleDeleteCase'))
          console.error('Failed to delete case: ', error);
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
          toast.success(t('toastSuccess.handleAddEnvolvido'))
          refetch();
        },
        onError: (error) => {
          toast.error(t('toastError.handleAddEnvolvido'))
          console.error('Falha na API ao adicionar investigado:', error);
        }
      }
    );
  };

  const handleAddSuspectsBatch = (file: File) => {
    addSuspectsBatchMutation.mutate(
      { caseId, file },
      {
        onSuccess: () => {
          setShowAddSuspectsBatchModal(false);
          refetch();
        },
        onError: (error) => {
          console.error('Falha na API ao adicionar investigados por lote: ', error);
        },
      }
    );
  };

  const handleAllowVisualization = (userId: string) => {
    allowViewMutation.mutate({ caseId, userId }, {
      onSuccess: () => {
        setShowAllowVisualizationModal(false);
        refetch();
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
          toast.success(t('toastSuccess.handleRemoveEnvolvido'));
          refetch();
        },
        onError: (error) => {
          toast.error(t('toastError.handleRemoveEnvolvido'));
          console.error('Erro ao remover investigado:', error);
        },
      }
    );
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setShowRemoveFileModal({ open: false, index: null });
    toast.success(t('toastSuccess.handleRemoveArquivo'));
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
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
          <p>{t('cases.errorMessage')}</p>
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
              variant="contained"
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
            <div className={styles.caseNameRow}>
              <h2 className={styles.h2} data-testid='case-name'>{caseDetails.name}</h2>
              <div data-testid='case-actions' className={styles.caseActions}>
                <Tooltip title="Ações">
                  <IconButton size="medium" onClick={handleClickMenu}>
                    <MoreVert fontSize="inherit" sx={{ color: 'black' }} />
                  </IconButton>
                </Tooltip>
                <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleCloseMenu}
                  disableScrollLock={true}
                  slotProps={{
                    list: {
                      'aria-labelledby': 'basic-button',
                    },
                    paper: {
                      elevation: 2,
                    }
                  }}
                >
                  <MenuItem 
                    data-testid="menu-change-name"
                    sx={{ fontFamily: 'var(--font-poppins), sans-serif;' }}
                    onClick={() => { handleCloseMenu(); setShowNameModal(true); }}
                  >
                    {t('cases.title.changeName')}
                  </MenuItem>
                  <MenuItem
                    data-testid="menu-change-situation"
                    sx={{ fontFamily: 'var(--font-poppins), sans-serif;' }}
                    onClick={() => { handleCloseMenu(); setShowSituationModal(true); }}
                  >
                    {t('cases.title.changeSituation')}
                    </MenuItem>
                  <MenuItem
                    data-testid="menu-allow-view"
                    sx={{ fontFamily: 'var(--font-poppins), sans-serif;' }}
                    onClick={() => { handleCloseMenu(); setShowAllowVisualizationModal(true); }}
                  >
                    {t('cases.title.allowView')}
                  </MenuItem>
                  
                  {isAdmin && [
                      <MenuItem
                        key="change-owner"
                        data-testid="menu-change-case-owner"
                        sx={{ fontFamily: 'var(--font-poppins), sans-serif;' }}
                        onClick={() => { handleCloseMenu(); setShowChangeResponsibleModal(true); }}
                      >
                        {t('cases.title.changeResponsible')}
                      </MenuItem>,
                      <MenuItem
                        key="delete-case"
                        data-testid="menu-delete-case"
                        sx={{ fontFamily: 'var(--font-poppins), sans-serif;' }}
                        onClick={() => { handleCloseMenu(); setShowDeleteCaseModal(true); }}
                      >
                        {t('cases.title.delete')}
                      </MenuItem>

                    ]}
                </Menu>
              </div>
            </div>
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

          <ListPeople
            caseId={caseId}
            users={usersWithAccess}
            onRemoveUser={(userId) => {
              removeUserMutation.mutate({ caseId, userId: userId.toString() });
            }}
          />

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
                <div className={styles.investigatedButtons} data-testid="add-investigated-buttons">
                  <Button
                    data-testid='add-suspects-batch'
                    icon={<NoteAddOutlinedIcon />}
                    variant="contained"
                    size="icon"
                    label=""
                    onClick={() => setShowAddSuspectsBatchModal(true)}
                    disabled={!newName.trim() || !newCpf.trim()}
                  />
                  <Button
                    data-testid='add-suspect'
                    icon={<AddIcon />}
                    variant="contained"
                    size="icon"
                    label=""
                    onClick={handleAddSuspect}
                  />
                </div>
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
            data-testid="modal-change-name"
            isOpen={showNameModal}
            onClose={() => setShowNameModal(false)}
            icon={<FiEdit2 size={36} color="#ff3636" />}
            title={t('cases.title.changeName')}
            description={t('cases.title.changeNameDesc')}
            primaryLabel={t('cases.title.save')}
            onPrimary={handleUpdateName}
            secondaryLabel={t('cases.title.cancel')}
            onSecondary={() => setShowNameModal(false)}
            primaryLoading={updateNameMutation.isPending}
          >
            <input
              type="text"
              value={newCaseName}
              onChange={(e) => setNewCaseName(e.target.value as CaseItem['name'])}
              className={styles.input}
              style={{ marginBottom: 16, marginTop: 8, width: '100%' }}
              placeholder={t('cases.title.inputName')}
            />
          </ConfirmationModal>
        )}

        {showSituationModal && (
          <ConfirmationModal
            data-testid="modal-change-situation"
            isOpen={showSituationModal}
            onClose={() => setShowSituationModal(false)}
            icon={<FiEdit2 size={36} color="#ff3636" />}
            title={t('cases.title.changeSituation')}
            description={t('cases.title.changeSituationDesc')}
            primaryLabel={t('cases.title.save')}
            onPrimary={handleUpdateSituation}
            secondaryLabel={t('cases.title.cancel')}
            onSecondary={() => setShowSituationModal(false)}
            primaryLoading={updateSituationMutation.isPending}
          >
            <select
              value={newSituation}
              onChange={(e) => setNewSituation(e.target.value as CaseItem['status'])}
              className={styles.input}
              style={{ marginBottom: 16, marginTop: 8, width: '100%' }}
            >
              <option value="">
                {t('cases.title.selectSituation')}
              </option>
              <option value="Em andamento">
                {t('cases.title.situationOngoing')}
              </option>
              <option value="Suspenso">
                {t('cases.title.situationSuspended')}
              </option>
              <option value="Encerrado">
                {t('cases.title.situationClosed')}
              </option>
            </select>
          </ConfirmationModal>
        )}

        {showDeleteCaseModal && (
          <RemoveModal
            data-testid="delete-case-modal"
            isOpen={showDeleteCaseModal}
            onClose={() => setShowDeleteCaseModal(false)}
            title={t('cases.title.delete', { defaultValue: 'Excluir caso?' })}
            description={t('cases.title.deleteWarning', {
              defaultValue:
                'Ao excluir este caso, todos os vínculos relacionados poderão ser perdidos.',
            })}
            onRemove={handleDeleteCase}
            isProcessing={deleteCaseMutation.isPending}
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
            title={t('cases.title.addFile')}
            description={t('cases.title.addFileDesc')}
            primaryLabel={t('cases.title.save')}
            onPrimary={() => setShowUploadModal(false)}
            secondaryLabel={t('cases.title.cancel')}
            onSecondary={() => setShowUploadModal(false)}
          ></ConfirmationModal>
        )}

        {showAllowVisualizationModal && (
          <AllowVisualizationModal
            data-testid="modal-allow-visualization"
            isOpen={showAllowVisualizationModal}
            onClose={() => setShowAllowVisualizationModal(false)}
            onSubmit={handleAllowVisualization}
            isSubmitting={allowViewMutation.isPending}
          />
        )}

        {showAddSuspectsBatchModal && (
          <AddSuspectsBatchModal
            isOpen={showAddSuspectsBatchModal}
            onClose={() => setShowAddSuspectsBatchModal(false)}
            onSubmit={handleAddSuspectsBatch}
            isSubmitting={addSuspectsBatchMutation.isPending}
          />
        )}
      </div>

    {showChangeResponsibleModal && (
      <ChangeOwnerModal
        data-testid="modal-change-responsible"
        isOpen={showChangeResponsibleModal}
        onClose={() => setShowChangeResponsibleModal(false)}
        onSubmit={handleUpdateOwner}
        isSubmitting={updateOwnerMutation.isPending}
      />
      )}
    </CaseContainer>
  );
}
