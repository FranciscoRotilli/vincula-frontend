import React, { ReactNode } from "react";
import styles from './Modal.module.css';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    onAdd?: () => void; // Adiciona função para o botão Adicionar
    size?: 'small' | 'medium' | 'large' | 'fullscreen';
    closeOnOverlayClick?: boolean;
    actions?: React.ReactElement<unknown, string | React.JSXElementConstructor<any>>;
};

const Modal = ({
    isOpen,
    onClose,
    children,
    title,
    onAdd,
    size = 'medium',
    closeOnOverlayClick = true
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
        <div className={styles.overlay} onClick={handleOverlayClick} data-testid="overlay" >
            <div
                className={`${styles.container} ${styles[size]}`}
                onClick={(e) => e.stopPropagation()}
                data-testid="modal-container"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {title !== undefined && (
                    <header className={styles.header}>
                        <h2 className={styles.title} id="modal-title">{title}</h2> {/* Adicione o id aqui */}
                        <button className={styles.closeButton} onClick={onClose}>
                            &times;
                        </button>
                    </header>
                )}

                <main className={styles.content}>
                    {children}
                </main>

                <footer className={styles.footer}>
                    <button
                        className={styles.buttonModal}
                        onClick={onAdd}
                    >
                        Adicionar
                    </button>
                    <button
                        className={`${styles.buttonModal} ${styles.secondary}`}
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default Modal