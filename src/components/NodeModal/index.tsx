import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

import { t } from '@/texts';

import { maskCpfCnpj, maskPhone } from '../../../utils/functions';
import styles from './NodeModal.module.css';

type NodeModalProps = {
  isOpen?: boolean;
  name: string;
  quantity: number;
  cpfCnpj: string;
  phone?: string;
};

export default function NodeModal({
  isOpen = false,
  name,
  quantity,
  cpfCnpj,
  phone,
}: Readonly<NodeModalProps>) {
  const [open, setOpen] = useState(isOpen);

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button
          className={styles.close}
          onClick={() => setOpen(false)}
          aria-label={t('nodeModal.close')}
        >
          <FiX size={28} />
        </button>
        <div className={styles.header}>
          <div className={styles.title}>{name.toUpperCase()}</div>
        </div>
        <div className={styles.body}>
          <div>
            <strong>{t('nodeModal.quantity')}</strong> {quantity}
          </div>
          <div>
            <strong>{t('nodeModal.cpfCnpj')}</strong> {maskCpfCnpj(cpfCnpj)}
          </div>
          {phone && (
            <div>
              <strong>{t('nodeModal.phone')}</strong> {maskPhone(phone)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}