'use client';
import React, { useMemo, useState } from 'react';
import Modal from '@/components/modalGenerico/Modal';
import { Box, TextField } from '@mui/material';

import modalStyles from '@/components/modalGenerico/Modal.module.css';
import showcaseStyles from './modal.module.css';

type CreateCaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { caseName: string; caseResponsable: string, creationDate: string }) => Promise<void> | void;
};

const CASE_RESPONSABLE = 'Flavia'

export default function CreateCaseModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateCaseModalProps) {
  const [caseName, setCaseName] = useState('')
  const creationDate = useMemo(() => (new Date()), [isOpen])
  
  const [open, setOpen] = useState(isOpen);

  const handleSubmit = async () => {
    await onSubmit({
      caseName: caseName,
      caseResponsable: CASE_RESPONSABLE,
      creationDate: creationDate.toUTCString(),
    });
  }

  return (
    <Modal
        isOpen= {open}
        onClose={() => setOpen(false)}
        title="Adicionar Caso"
        size="medium"
        actions={
          <>
            <button className={`${modalStyles.button} ${modalStyles.secondary}`} onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button className={`${modalStyles.button} ${modalStyles.primary}`} onClick={async () => {
              await handleSubmit();
              console.log('Formulário enviado!');
              setOpen(false);
            }}>
              Adicionar
            </button>
          </>
        }
      >
        <div className={modalStyles.formStack}>
          <label>Nome do caso:</label>
          <input className={modalStyles.textInput} type="text" value={caseName} onChange={(e) => setCaseName(e.target.value)}/>
          <label>Nome do responsável:</label>
          <TextField className={modalStyles.textInput} type="text" value={CASE_RESPONSABLE}/>
          <label>Data de criação:</label>
          <TextField className={modalStyles.textInput} type="text" value={creationDate}/>
        </div>
      </Modal>
  );
}
