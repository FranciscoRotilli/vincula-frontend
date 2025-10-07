import React from 'react';
import { FiX } from 'react-icons/fi';

import { t } from '@/texts';
import { maskCpfCnpj, maskPhone } from '@/utils/functions';

import styles from './NodeModal.module.css';

type NodeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  quantity?: number;
  cpfCnpj: string;
  phone?: string;
  isRelationship?: boolean;
  sourceDatabase?: string;
  fileName?: string;
};

export default function NodeModal({
  isOpen,
  onClose,
  name,
  quantity,
  cpfCnpj,
  phone,
  isRelationship = false,
  sourceDatabase,
  fileName,
}: Readonly<NodeModalProps>) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button
          className={styles.close}
          onClick={onClose}
          aria-label={t('nodeModal.close')}
        >
          <FiX size={28} />
        </button>
        <div className={styles.header}>
          <div className={styles.title}>{name?.toUpperCase() || 'ELEMENTO SELECIONADO'}</div>
        </div>
        <div className={styles.body}>
          {isRelationship ? (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <strong>{t('nodeModal.sourceDatabase')}</strong> {sourceDatabase || 'N/A'}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>{t('nodeModal.source')}</strong> {fileName || 'N/A'}
              </div>
              {quantity !== undefined && (
                <div>
                  <strong>{t('nodeModal.quantity')}</strong> {quantity}
                </div>
              )}
            </div>
          ) : (
            <div>
              {quantity !== undefined && (
                <div>
                  <strong>{t('nodeModal.quantity')}</strong> {quantity}
                </div>
              )}
              {cpfCnpj && (
                <div>
                  <strong>{t('nodeModal.cpfCnpj')}</strong> {maskCpfCnpj(cpfCnpj)}
                </div>
              )}
              {phone && (
                <div>
                  <strong>{t('nodeModal.phone')}</strong> {maskPhone(phone)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}