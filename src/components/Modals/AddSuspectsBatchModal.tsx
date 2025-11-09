'use client';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useRef, useState } from 'react';

import Modal from '.';
import styles from './AddSuspectsBatchModal.module.css';

const MAX_SIZE_MB = 50;

type AddSuspectsBatchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
  isSubmitting?: boolean;
};

export default function AddSuspectsBatchModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: AddSuspectsBatchModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const isTooBig = (f: File) => f.size > MAX_SIZE_MB * 1024 * 1024;

  const isCsvFile = (f: File) => {
    const name = f.name.toLowerCase();
    const mime = (f.type || '').toLowerCase();
    return name.endsWith('.csv') || mime.includes('text/csv');
  };

  const handleFileInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (f && !isTooBig(f) && isCsvFile(f)) {
      setFile(f);
    }
  };

  const pickFile = (f?: File) => {
    if (f && !isTooBig(f) && isCsvFile(f)) {
      setFile(f);
    }
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    pickFile(f);
  };

  const handleSubmit = () => {
    if (file && !isSubmitting) {
      onSubmit(file);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onAction={handleSubmit}
      actionButton={isSubmitting ? 'Salvando...' : 'Adicionar'}
      cancelButton="Cancelar"
      title="Adicionar lista de investigados"
      description="O arquivo deve possuir as colunas nome, cpfCnpj e telefone separados por ponto e vírgula"
      size="medium"
      data-testid="modal-add-suspects-batch"
      actionDisabled={!file || isSubmitting}
    >
      <div
        className={`${styles.dropzone} ${dragActive ? styles.dragActive : ''}`}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
        data-testid="dropzone"
      >
        <input
          ref={fileInputRef}
          type="file"
          className={styles.inputFile}
          onChange={handleFileInput}
          accept=".csv,text/csv"
          data-testid="file-input"
        />
        <div className={styles.dropzoneContent}>
          <FileUploadIcon fontSize="large" />
          <span className={styles.dropzoneText}>
            {file ? file.name : 'Selecione ou arraste o arquivo CSV'}
          </span>
        </div>
      </div>
    </Modal>
  );
}