'use client';
import React, { useState } from 'react';

import Input from '@/components/Input';
import Modal from '@/components/Modals';
import modalStyles from '@/components/Modals/Modal.module.css';
import { t } from '@/texts';

type SaveFilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { filterName: string }) => Promise<void> | void;
  isSubmitting?: boolean;
};

export default function SaveFilterModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: SaveFilterModalProps) {
  const [filterName, setFilterName] = useState('');

  const canSave = filterName.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSave || isSubmitting) return;
    onSubmit({ filterName: filterName.trim() });
    handleClose();
  };

  const handleClose = () => {
    setFilterName('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Salvar Filtro"
      size="medium"
      onClose={handleClose}
      onAction={handleSubmit}
      actionButton={isSubmitting ? 'Salvando...' : 'Salvar'}
      actionDisabled={!canSave || isSubmitting}
      cancelButton="Cancelar"
    >
      <div className={modalStyles.formStack}>
        <div className={modalStyles.formGroup}>
          <label>{t('modal.filterName')}</label>
          <Input
            placeholder={'Digite o nome do filtro'}
            onChange={(e) => setFilterName(e.target.value)}
            value={filterName}
          />
        </div>
      </div>
    </Modal>
  );
}