'use client';

import { MdClose } from 'react-icons/md';
import Modal from '@mui/material/Modal';
import Image from 'next/image';

import Button from '../Button';
import styles from './RemoveModal.module.css';

interface RemoveModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  onRemove: () => void;
}

export default function RemoveModal({
  title,
  description,
  isOpen,
  onClose,
  onRemove,
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
            label="Remover"
            variant="contained"
            className={styles.removeButton}
            onClick={onRemove}
          />
          <Button label="Cancelar" variant="error" onClick={onClose} />
        </div>
      </div>
    </Modal>
  );
}
