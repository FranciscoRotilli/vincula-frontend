'use client';

import { useState } from 'react';
import Button from '../Button';
import { MdOutlineCloudUpload } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';
import styles from './FilesSection.module.css';
import Table from '../GenericTable';
import { Column } from '@/types/Table';
import { File } from '@/types/Files';
import { t } from '@/texts';
import RemoveModal from '../Modals/RemoveModal';
import CreateCaseModal from '../Modals/CreateCaseModal';
import { useCaseById } from '@/hooks/useCase';
import { useRemoveFile } from '@/hooks/useFile';

const dataMock: any = [
  { id: 1, name: 'ExtratoDetalhado.csv', createdDate: '10 Ago 2025 10:00:00', size: '4.2 MB' },
  { id: 2, name: 'Extrato_2.xlsx', createdDate: '10 Ago 2025 10:00:00', size: '21 KB' },
];

const columns: Column<File>[] = [
  { key: 'name', label: 'NOME', align: 'left' },
  { key: 'creation_date', label: 'DATA DE INCLUSÃO', align: 'left' },
  { key: 'size', label: 'TAMANHO', align: 'left' },
];

type FilesSectionProps = {
  caseId: string;
};

export default function FilesSection({ caseId }: FilesSectionProps) {
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [fileToRemove, setFileToRemove] = useState<File | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false); // usar quando o modal de upload estiver pronto

  const { data: caseData, isLoading } = useCaseById(caseId);
  const removeFileMutation = useRemoveFile(caseId);

  const handleRemove = () => {
    if (fileToRemove) {
      removeFileMutation.mutate(fileToRemove.id, {
        onSuccess: () => {
          setIsRemoveModalOpen(false);
          setFileToRemove(null);
        },
      });
    }
  };

  const rowActions = [
    {
      label: 'Delete',
      icon: <RiDeleteBin6Line size={18} color="var(--button-error)" />,
      onClick: (row: File) => {
        setFileToRemove(row);
        setIsRemoveModalOpen(true);
      },
    },
  ];

  return (
    <section className={styles.filesContainer}>
      <div className={styles.uploadSection}>
        <strong>{t('files.title', { count: caseData?.archives?.length ?? 0 })}</strong>
        <p className={styles.filesDescription}>{t('files.description')}</p>
        <Button
          className={styles.uploadButton}
          data-testid="upload-file-button"
          icon={<MdOutlineCloudUpload />}
          variant="contained"
          label="Upload"
          onClick={() => setIsUploadModalOpen(true)}
        />
      </div>

      <div className={styles.tableSection}>
        <Table
          columns={columns}
          data={caseData?.archives ?? []}
          loading={isLoading}
          variant="outlined"
          rowActions={rowActions}
        />
      </div>

      <RemoveModal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        onRemove={handleRemove}
        title={t('removeFileModal.title')}
        description={t('removeFileModal.description')}
      />
    </section>
  );
}
