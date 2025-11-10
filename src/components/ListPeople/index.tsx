'use client';

import React from 'react';
import { TbTrash } from 'react-icons/tb';

import GenericTable from '@/components/GenericTable';
import { t } from '@/texts';
import { Column } from '@/types/Table';

export interface UserWithAccess {
  id: string | number;
  name: string;
  email?: string;
}

interface ListPeopleProps {
  caseId: string;
  users: UserWithAccess[];
  onRemoveUser?: (userId: string | number) => void;
  isLoading?: boolean;
}

export default function ListPeople({
  users,
  onRemoveUser,
  isLoading = false
}: ListPeopleProps) {
  const columns: Column<UserWithAccess>[] = [
    { key: 'name', label: 'Nome' },
  ];

  const rowActions = onRemoveUser ? [
    {
      icon: <TbTrash style={{ color: 'red', fontSize: 20 }} />,
      label: t('listPeople.removeAccess'),
      onClick: (row: UserWithAccess) => {
        onRemoveUser(row.id);
      },
    },
  ] : undefined;

  return (
    <GenericTable<UserWithAccess>
      columns={columns}
      data={users}
      rowActions={rowActions}
      loading={isLoading}
      variant="outlined"
    />
  )
}