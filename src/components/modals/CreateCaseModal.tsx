'use client';
import React, { useMemo, useState } from 'react';

import Modal from '@/components/modals/Modal';
import modalStyles from '@/components/modals/Modal.module.css';
import Input from '@/components/input/Input';

type CreateCaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    caseName: string;
    caseResponsable: string;
    creationDate: string; //formato dd/mm/aaaa
  }) => Promise<void>|void;
};


const CASE_RESPONSABLE = 'Flavia';

const formatDate = (d: Date) => {
  const dd = String (d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2,'0');
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`
}

export default function CreateCaseModal ({
  isOpen,
  onClose,
  onSubmit,
}: CreateCaseModalProps) {
  const [caseName, setCaseName] = useState('')
  
  const creationDate = useMemo(() => (isOpen ? new Date() : null), [isOpen]);
  const creationDateFormated = creationDate ? formatDate(creationDate) : '';

  const canSave = caseName.trim().length > 0;
    
  const handleSubmit = async () => {
    if (!canSave) return;
    await onSubmit ({
      caseName: caseName,
      caseResponsable: CASE_RESPONSABLE,
      creationDate: creationDateFormated,
    })
    setCaseName('');
    onClose();
  }

  return (
    <Modal
        isOpen={isOpen}
        title="Adicionar caso"
        size='medium'
        onClose={function (): void {
          setCaseName('');
          onClose();
        }}
        onAction={handleSubmit}
        actionButton = 'Adicionar'
        cancelButton = 'Cancelar'
      >
        <div className={modalStyles.formStack}>
          <label>Nome do caso:</label>
          <Input placeholder={''} onChange={(e) => setCaseName(e.target.value)} value={caseName}/>
          <label>Nome do responsável:</label>
          <Input placeholder={''} disabled value={CASE_RESPONSABLE}/>
          <label>Data de criação:</label>
          <Input placeholder={''} disabled value={creationDateFormated}/>
        </div>
      </Modal>
  );
}
