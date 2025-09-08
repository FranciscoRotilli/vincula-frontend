'use client';
import React, { useMemo, useState } from 'react';

import Input from '@/components/Input';
import Modal from '@/components/Modals';
import modalStyles from '@/components/Modals/Modal.module.css';

type CreateCaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    caseName: string;
    caseResponsable: string;
    creationDate: string;
  }) => Promise<void> | void;
};

const CASE_RESPONSABLE = 'Flavia';

const formatDate = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
};

export default function CreateCaseModal({ isOpen, onClose, onSubmit }: CreateCaseModalProps) {
  const [caseName, setCaseName] = useState('');

  const creationDate = useMemo(() => (isOpen ? new Date() : null), [isOpen]);
  const creationDateFormated = creationDate ? formatDate(creationDate) : '';

  const canSave = caseName.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSave) return;
    await onSubmit({
      caseName: caseName,
      caseResponsable: CASE_RESPONSABLE,
      creationDate: creationDateFormated,
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
      actionButton="Adicionar"
      cancelButton="Cancelar"
    >
      <div className={modalStyles.formStack}>
        <label>Nome do caso:</label>
        <Input placeholder={'Digite o nome do caso'} onChange={(e) => setCaseName(e.target.value)} value={caseName} />
        
        <label>Nome do responsável:</label>
        <Input placeholder={''} disabled value={CASE_RESPONSABLE} />
        
        <label>Data de criação:</label>
        <Input placeholder={''} disabled value={creationDateFormated} />
      </div>
    </Modal>
  );
}
