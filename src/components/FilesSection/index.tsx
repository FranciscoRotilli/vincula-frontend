'use client';

import { useState } from 'react';
import { MdOutlineCloudUpload } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';

import { useCaseById } from '@/hooks/useCase';
import { useRemoveFile } from '@/hooks/useFile';
import { t } from '@/texts';
import { File } from '@/types/Files';
import { Column } from '@/types/Table';

import Button from '../Button';
import Table from '../GenericTable';
import AddFileModal from '../ModalAddFile';
import RemoveModal from '../Modals/RemoveModal';
import styles from './FilesSection.module.css';

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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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
    <>
      <div className={styles.uploadSection}>
        <h1 className={styles.sectionTitle}>
          {t('files.title', { count: caseData?.archives?.length ?? 0 })}
        </h1>
        <p className={styles.filesDescription}>{t('files.description')}</p>
        <Button
          className={styles.uploadButton}
          data-testid="upload-file-button"
          icon={<MdOutlineCloudUpload />}
          variant="contained"
          label="Upload"
          size="large"
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
        onSubmit={() => console.log('Add file')}
      />
      <RemoveModal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        onRemove={handleRemove}
        title={t('removeFileModal.title')}
        description={t('removeFileModal.description')}
      />
    </>
  );
}
