import Image from 'next/image';
import React, { ReactNode, useEffect } from 'react';

import styles from './Modal.module.css';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
	description?: string;
  icon?: ReactNode;
  children?: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closeOnOverlayClick?: boolean;
  actionButton?: string;
  cancelButton?: string;
  disableEscapeKeyDown?: boolean;
  onAction?: () => void;
  isError?: boolean;
  actionButtonColor?: 'primary' | 'error';
};

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  icon,
  size = 'medium',
  closeOnOverlayClick = true,
  disableEscapeKeyDown = false,
  onAction,
  actionButton,
  cancelButton,
  isError = false,
  actionButtonColor = 'primary',
}: ModalProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen && !disableEscapeKeyDown) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, disableEscapeKeyDown]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        className={`${styles.container} ${styles[size]}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <header className={styles.header}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            {icon && <div style={{ margin: '0 auto 12px auto' }}>{icon}</div>}
            {title && (
              <h2 className={styles.title} data-testid="modal-title" style={{ textAlign: 'center' }}>
                {title}
              </h2>
            )}
            {description && (
              <div style={{ color: '#222', fontSize: '1rem', textAlign: 'center', marginBottom: 8 }}>
                {description}
              </div>
            )}
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Fechar">
            &times;
          </button>
        </header>
        <div className={styles.body}>
          <main className={styles.content}>{children}</main>
        </div>
        {(cancelButton || actionButton) && (
          <footer className={styles.footer}>
            {actionButton && (
              <button
                className={
                  actionButtonColor === 'error'
                    ? `${styles.button} ${styles.error}`
                    : `${styles.button} ${styles.primary}`
                }
                onClick={onAction}
              >
                {actionButton}
              </button>
            )}
            {cancelButton && (
              <button
                className={`${styles.button} ${styles.secondary}`}
                onClick={onClose}
              >
                {cancelButton}
              </button>
            )}
          </footer>
        )}
      </div>
    </div>
  );
};

export default Modal;
