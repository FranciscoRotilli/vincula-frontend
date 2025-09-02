import React, { ReactNode, useEffect } from 'react';
import styles from './Modal.module.css';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closeOnOverlayClick?: boolean;
  buttons?: string[];
  disableEscapeKeyDown?: boolean;
  onAction?: () => void;
  isError?: boolean;
};

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'medium',
  closeOnOverlayClick = true,
  disableEscapeKeyDown = false,
  buttons,
  onAction,
  isError = false,
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
        {title && (
          <header className={styles.header}>
            <h2 className={styles.title} id="modal-title">
              {title}
            </h2>
            <button className={styles.closeButton} onClick={onClose} aria-label="Fechar">
              &times;
            </button>
          </header>
        )}

        <main className={styles.content}>{children}</main>

        {buttons && (
          <footer className={styles.footer}>
            <button className={isError ? `${styles.button}` : `${styles.button} ${styles.secondary}`} onClick={onClose}>
              {buttons[0]}
            </button>
            <button
              className={isError ? `${styles.button} ${styles.error}` : `${styles.button} ${styles.primary}`}
              onClick={onAction}
            >
              {buttons[1]}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

export default Modal;
