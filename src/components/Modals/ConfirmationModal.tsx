'use client';
import React from 'react';

import Modal from '.';

type ConfirmationModalProps = {
  buttonsPosition?: 'left' | 'center' | 'right';
  isOpen: boolean;
  onClose: () => void;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  primaryColor?: string;
  primaryLoading?: boolean;
  primaryLoadingLabel?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
};

export default function ConfirmationModal({
  buttonsPosition,
  isOpen,
  onClose,
  icon,
  title,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  primaryColor,
  primaryLoading,
  primaryLoadingLabel,
  children,
  'data-testid': dataTestId,
}: Readonly<ConfirmationModalProps>) {
  const primaryVariant = primaryColor === 'error' ? 'error' : 'primary';
  const gerund = primaryLabel.replace(/r$/i, '') + 'ndo';
  const actionLabel = primaryLoading
    ? primaryLoadingLabel ?? gerund
    : primaryLabel;

  return (
    <Modal
      data-testid={dataTestId}
      buttonsPosition={buttonsPosition ?? 'center'}
      showCloseIcon={false}
      onAction={onPrimary}
      isOpen={isOpen}
      onClose={onClose}
      icon={icon}
      title={title}
      description={description}
      size="medium"
      closeOnOverlayClick={true}
      actionButton={actionLabel}
      cancelButton={secondaryLabel}
      actionButtonColor={primaryVariant}
      actionDisabled={!!primaryLoading}
    >
      {children}
    </Modal>
  );
}
