/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';

import { getCurrentUser } from '@/services/auth';
import { allowUserToViewCase } from '@/services/caseService';
import { getUsers } from '@/services/userService';

import Button from '../Button';
import { CustomSelect } from '../Select';
import styles from './AllowVisualizationModal.module.css';

type AllowVisualizationModalProps = {
  isOpen: boolean;
  caseId: string;
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

export default function AllowVisualizationModal({
  isOpen,
  caseId,
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
}: Readonly<AllowVisualizationModalProps>) {
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [ ,setUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);

        getUsers()
          .then((allUsers) => {
            const filteredUsers = allUsers.filter((u) => u.name !== currentUser.username);
            setUsers(filteredUsers);
          })
          .catch((err) => console.error('Erro ao buscar usuários:', err));
      })
      .catch((err) => console.error('Erro ao buscar usuário logado:', err));
  }, []);

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
        <CustomSelect
          options={users.map((u) => ({ value: u.id, label: u.name }))}
          placeholder="Selecione um usuário"
          value={selectedUser?.name ?? null}
          onChange={(v) => {
            const selected = users.find((u) => u.id === v);
            setSelectedUser(selected ?? null);
          }}
          isControlled
        />
        <div className={styles.actions}>
          <Button
            label={primaryLabel}
            variant="error"
            disabled={!selectedUser}
            className={`${styles.btnPrimary}${primaryColor ? ' ' + styles.customPrimaryColor : ''}`}
            onClick={async () => {
              if (!selectedUser) return;
              try {
                await allowUserToViewCase(caseId, selectedUser.id);
                onPrimary();
                window.location.reload();
              } catch (err) {
                alert('Erro ao salvar usuário.');
              }
            }}
          />
          <Button
            label={secondaryLabel}
            variant="outlined"
            className={`${styles.btnSecondary}${secondaryColor ? ' ' + styles.customSecondaryColor : ''}`}
            onClick={onSecondary}
          />
        </div>
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
