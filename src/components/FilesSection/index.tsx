'use client';

import { useState } from 'react';
import { MdOutlineCloudUpload } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';

import { useCaseById } from '@/hooks/useCase';
import { useRemoveFile } from '@/hooks/useFile';
import { t } from '@/texts';
import { FileResponse } from '@/types/Files';
import { Column } from '@/types/Table';

import Button from '../Button';
import Table from '../GenericTable';
import AddFileModal from '../ModalAddFile';
import RemoveModal from '../Modals/RemoveModal';
import styles from './FilesSection.module.css';

const columns: Column<FileResponse>[] = [
  { key: 'name', label: 'NOME', align: 'left' },
  { key: 'creation_date', label: 'DATA DE INCLUSÃO', align: 'left' },
  { key: 'size', label: 'TAMANHO', align: 'left' },
];

type FilesSectionProps = {
  caseId: string;
};

export default function FilesSection({ caseId }: FilesSectionProps) {
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [fileToRemove, setFileToRemove] = useState<FileResponse | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: caseData, isLoading, refetch } = useCaseById(caseId);
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
      onClick: (row: FileResponse) => {
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

      <AddFileModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={() => refetch()}
        caseId={caseId}
      />
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
