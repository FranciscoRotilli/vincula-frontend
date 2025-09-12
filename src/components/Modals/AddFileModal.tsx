'use client';
import React, { useId, useRef, useState } from 'react';
import Modal from '@/components/Modals';
import styles from './AddFileModal.module.css';

import CloudUploadOutlinedIcon from '@mui/icons-material/UploadOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';

type AddFileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { origin: string; type: string; file: File }) => Promise<void> | void;
};

const ORIGIN_OPTIONS = [
  { value: 'local', label: 'Local' },
  { value: 's3', label: 'S3' },
  { value: 'gdrive', label: 'Google Drive' },
];

const TYPE_OPTIONS = [
  { value: 'csv', label: 'CSV' },
  { value: 'pdf', label: 'PDF' },
  { value: 'xlsx', label: 'Planilha Excel' },
];

const ACCEPT =
  '.csv,.pdf,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const MAX_SIZE_MB = 50;

export default function AddFileModal({ isOpen, onClose, onSubmit }: AddFileModalProps) {
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [origin, setOrigin] = useState('');
  const [type, setType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setOrigin('');
    setType('');
    setFile(null);
    setDragActive(false);
    setError(null);
  };

  const validateFile = (f: File | null) => {
    if (!f) return 'Arquivo inválido.';
    const tooBig = f.size > MAX_SIZE_MB * 1024 * 1024;
    if (tooBig) return `Arquivo acima de ${MAX_SIZE_MB} MB.`;
    return null;
  };

  const pickFile = (f?: File) => {
    if (!f) return;
    const err = validateFile(f);
    setError(err);
    if (!err) setFile(f);
  };

  const handleFileInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    pickFile(f);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    pickFile(f);
  };

  const canSave = Boolean(origin && type && file);

  const handleSubmit = async () => {
    if (!canSave || !file) {
      setError((prev) => prev ?? 'Preencha os campos obrigatórios.');
      return;
    }
    await onSubmit({ origin, type, file });
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Adicionar arquivo"
      size="medium"
      actionButton="Adicionar"
      onAction={handleSubmit}
    >
      <div className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor={`${titleId}-origin`} className={styles.label}>
              Origem <span className={styles.required}>*</span>
            </label>
            <div className={styles.selectWrapper}>
              <select
                id={`${titleId}-origin`}
                className={styles.select}
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              >
                <option value="">Selecionar</option>
                {ORIGIN_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <KeyboardArrowDownOutlinedIcon className={styles.selectIcon} />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor={`${titleId}-type`} className={styles.label}>
              Tipo <span className={styles.required}>*</span>
            </label>
            <div className={styles.selectWrapper}>
              <select
                id={`${titleId}-type`}
                className={styles.select}
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">Selecionar</option>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <KeyboardArrowDownOutlinedIcon className={styles.selectIcon} />
            </div>
          </div>
        </div>

        <div className={styles.fieldFull}>
          <label htmlFor={`${titleId}-file`} className={styles.label}>
            Arquivo <span className={styles.required}>*</span>
          </label>

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
            aria-label="Selecione ou arraste o arquivo"
          >
            <input
              id={`${titleId}-file`}
              ref={fileInputRef}
              type="file"
              className={styles.inputFile}
              onChange={handleFileInput}
              accept={ACCEPT}
            />
            <div className={styles.dropzoneContent}>
              <CloudUploadOutlinedIcon fontSize="large" />
              <span className={styles.dropzoneText}>
                {file ? file.name : 'Selecione ou arraste o arquivo'}
              </span>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </div>
      </div>
    </Modal>
  );
}
