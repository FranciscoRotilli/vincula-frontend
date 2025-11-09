'use client';
import React, { useEffect, useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';

import Modal from '@/components/Modals';
import { CustomSelect } from '@/components/Select';
import { getCurrentUser } from '@/services/auth';
import { getUsers } from '@/services/userService';
import { t } from '@/texts';
import { CurrentUser } from '@/types/User';

type AllowVisualizationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: string) => Promise<void> | void;
  isSubmitting?: boolean;
};

export default function AllowVisualizationModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: AllowVisualizationModalProps) {
  const [, setUser] = useState<CurrentUser | null>(null);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        const allUsers = await getUsers();
        const filtered = allUsers.filter((u) => u.name !== currentUser.username);
        setUsers(filtered);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
      }
    }

    if (isOpen) {
      fetchUsers();
      setSelectedUser(null);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!selectedUser || isSubmitting) return;
    try {
      await onSubmit(selectedUser.id);
      onClose();
    } catch (err) {
      alert('Erro ao salvar usuário.');
    } finally {
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={t('cases.title.allowView')}
      onClose={onClose}
      onAction={handleSubmit}
      actionButton={isSubmitting ? 'Salvando...' : t('cases.title.save')}
      cancelButton={t('cases.title.cancel')}
      description={t('cases.title.allowViewDesc')}
      icon={<FiUserPlus size={36} color="#FB8500" />}
      actionDisabled={!selectedUser || isSubmitting}
    >
      <>
        <CustomSelect
          options={users.map((u) => ({ value: u.id, label: u.name }))}
          placeholder={t('cases.title.allowView.select.placeholder')}
          value={selectedUser?.name ?? null} 
          onChange={(v) => {
            const selected = users.find((u) => u.id === v);
            setSelectedUser(selected ?? null);
          }}
          isControlled
        />
      </>
    </Modal>
  );
}
