'use client';

import { CircularProgress, Modal } from '@mui/material';
import Image from 'next/image';
import { MdClose } from 'react-icons/md';

import Button from '../Button';
import styles from './RemoveModal.module.css';

interface RemoveModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  onRemove: () => void;
  isLoading?: boolean;
}

export default function RemoveModal({
  title,
  description,
  isOpen,
  onClose,
  onRemove,
  isLoading = false,
}: RemoveModalProps) {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className={styles.modalContainer}>
        <div className={styles.closeButtonContainer}>
          <MdClose size={22} onClick={onClose} className={styles.closeButton} />
        </div>

        <Image src="/remove-modal-icon.svg" alt={`Ícone para "${title}"`} width={258} height={84} />

        <h2 className={styles.title}>{title}</h2>

        <p className={styles.description}>{description}</p>

        <div className={styles.buttons}>
          <Button
            label={isLoading ? <CircularProgress size={20} /> : 'Remover'}
            variant="contained"
            className={styles.removeButton}
            onClick={onRemove}
            disabled={isLoading}
          />
          <Button label="Cancelar" variant="error" onClick={onClose} />
        </div>
      </div>
    </Modal>
  );
}
