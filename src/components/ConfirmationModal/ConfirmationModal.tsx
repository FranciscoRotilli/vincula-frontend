/* eslint-disable max-len */
import React from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';

import Button from '../Button';
import styles from './ConfirmationModal.module.css';

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
  primaryColor?: string;
  secondaryColor?: string;
  children?: React.ReactNode;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
  primaryLoading?: boolean;
  primaryLoadingLabel?: string;
};

export default function ConfirmationModal({
  isOpen,
  onClose,
  icon,
  title,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  primaryColor,
  secondaryColor,
  children,
  primaryDisabled = false,
  secondaryDisabled = false,
  primaryLoading = false,
  primaryLoadingLabel,
}: Readonly<ConfirmationModalProps>) {
  if (!isOpen) return null;

  const modalContent = (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose} aria-label="Fechar">
          <FiX size={26} />
        </button>
        {icon && <div className={styles.icon}>{icon}</div>}
        <h2 className={styles.title}>{title}</h2>
        {description && <div className={styles.desc}>{description}</div>}
        {children}
        <div className={styles.actions}>
          <Button
            label={primaryLabel}
            variant="error"
            className={`${styles.btnPrimary}${primaryColor ? ' ' + styles.customPrimaryColor : ''}`}
            disabled={primaryDisabled}
            loading={primaryLoading}
            loadingLabel={primaryLoadingLabel}
            onClick={onPrimary}
          />
          <Button
            label={secondaryLabel}
            variant="outlined"
            className={`${styles.btnSecondary}${secondaryColor ? ' ' + styles.customSecondaryColor : ''}`}
            disabled={secondaryDisabled}
            onClick={onSecondary}
          />
        </div>
      </div>
    </div>
  );

  return typeof window !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}
