'use client';
import React, { useEffect, useMemo, useState } from 'react';

import Input from '@/components/Input';
import Modal from '@/components/Modals';
import modalStyles from '@/components/Modals/Modal.module.css';
import { getCurrentUser } from '@/services/auth';
import { t } from '@/texts';
import { CurrentUser } from '@/types/User';

type CreateCaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { caseName: string }) => Promise<void> | void;
  isSubmitting?: boolean;
};

const formatDate = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
};

export default function CreateCaseModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreateCaseModalProps) {
  const [caseName, setCaseName] = useState('');
  const [user, setUser] = useState<CurrentUser | null>(null);
  useEffect(() => {
    async function fetchUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    fetchUser();
  }, []);

  const CASE_RESPONSABLE = user ? user.username : '';

  const creationDate = useMemo(() => (isOpen ? new Date() : null), [isOpen]);
  const creationDateFormated = creationDate ? formatDate(creationDate) : '';

  const canSave = caseName.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSave || isSubmitting) return;
    await onSubmit({
      caseName: caseName,
    });
    setCaseName('');
    onClose();
  };

  const handleClose = () => {
    setCaseName('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Adicionar caso"
      size="medium"
      onClose={handleClose}
      onAction={handleSubmit}
      actionButton={isSubmitting ? 'Adicionando...' : 'Adicionar'}
      actionDisabled={!canSave || isSubmitting}
      cancelButton="Cancelar"
    >
      <div className={modalStyles.formStack}>
        <div className={modalStyles.formGroup}>
          <label>{t('modal.caseName')}</label>
          <Input placeholder={'Digite o nome do caso'} onChange={(e) => setCaseName(e.target.value)} value={caseName} />
        </div>

        <div className={modalStyles.formGroup}>
          <label>{t('modal.responsibleName')}</label>
          <Input placeholder={''} disabled value={CASE_RESPONSABLE} />
        </div>

        <div className={modalStyles.formGroup}>
          <label>{t('modal.creationDate')}</label>
          <Input placeholder={''} disabled value={creationDateFormated} />
        </div>
      </div>
    </Modal>
  );
}
