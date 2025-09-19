'use client';

import { useState } from 'react';
import Modal from '@mui/material/Modal';
import Image from 'next/image';
import Button from '../Button';

import styles from './RemoveModal.module.css';

interface RemoveModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function RemoveModal({ title, description, isOpen, onClose }: RemoveModalProps) {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className={styles.modalContainer}>
        <Image src="/remove-modal-icon.svg" alt={`Ícone para "${title}"`} width={258} height={84} />

        <h2 className={styles.title}>{title}</h2>

        <p className={styles.description}>{description}</p>

        <div className={styles.buttons}>
          <Button label="Remover" variant="contained" className={styles.removeButton} onClick={() => {}} />
          <Button label="Cancelar" variant="error" onClick={onClose} />
        </div>
      </div>
    </Modal>
  );
}
