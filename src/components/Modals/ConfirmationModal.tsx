/* eslint-disable max-len */
import React from 'react';

import Modal from '.';

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
	children,
	primaryColor,
}: Readonly<ConfirmationModalProps>) {
  const primaryVariant = primaryColor === 'error' ? 'error' : 'primary';

  return (
		<Modal
			buttonsPosition='center'
			showCloseIcon={false}
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
			actionButtonColor={primaryVariant}
		>
			{children}
    </Modal>
  );
}