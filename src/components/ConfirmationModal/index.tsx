/* eslint-disable max-len */
import React from 'react';

import Button from '../Button';
import Modal from '../Modals';
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
  // primaryColor,
  children,
}: Readonly<ConfirmationModalProps>) {
  // const primaryVariant = primaryColor === 'error' ? 'error' : 'contained';
  // const primaryClass = primaryColor && primaryColor !== 'error' ? styles.customPrimaryColor : '';
  // const secondaryClass = styles.btnSecondary;

  return (
		<Modal
			onAction={onPrimary}
      isOpen={isOpen}
      onClose={onClose}
      icon={icon}
      title={title}
      description={description}
      size="medium"
			closeOnOverlayClick={true}
			actionButton={primaryLabel}
			cancelButton={secondaryLabel}
			actionButtonColor={'error'}
		>
			{children}
    </Modal>
  );
}