import React, { ReactNode } from "react";
import styles from './Modal.module.css';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'small' | 'medium' | 'large' | 'fullscreen';
    closeOnOverlayClick?: boolean;
    actions?: ReactNode;
};

const Modal = ({
    isOpen,
    onClose,
    children,
    title,
    size = 'medium',
    closeOnOverlayClick = true,
    actions
}: ModalProps) => {
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
                aria-labelledby={title ? "modal-title" : undefined}
            >
                {title && (
                    <header className={styles.header}>
                        <h2 className={styles.title} id="modal-title">{title}</h2>
                        <button className={styles.closeButton} onClick={onClose} aria-label="Fechar">
                            &times;
                        </button>
                    </header>
                )}

                <main className={styles.content}>
                    {children}
                </main>

                {actions && (
                    <footer className={styles.footer}>
                        {actions}
                    </footer>
                )}
            </div>
        </div>
    );
};

export default Modal;
