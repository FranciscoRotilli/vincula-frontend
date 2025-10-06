'use client';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import React, { useId, useRef, useState } from 'react';

import Modal from '@/components/Modals';
import { useAddFile } from '@/hooks/useFile';
import { t } from '@/texts';
import { FileRequest } from '@/types/Files';

import styles from './AddFileModal.module.css';

type AddFileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  caseId: string;
};

const ORIGIN_OPTIONS = [
  { value: 'SIMBA', label: 'SIMBA' },
  { value: 'SITTEL', label: 'SITTEL' },
  { value: 'RIF', label: 'RIF' },
];

const TYPE_OPTIONS = [
  { value: 'CADASTRO_ASSINANTES', label: 'Cadastros dos Assinantes' },
  { value: 'EXTRATO_DETALHADO', label: 'Extrato Detalhado' },
  { value: 'RIF', label: 'RIF' },
];

const MAX_SIZE_MB = 50;

const ACCEPT_BY_TYPE: Record<string, string> = {
  csv: '.csv,text/csv',
};

export default function AddFileModal({ isOpen, onClose, onSubmit, caseId }: AddFileModalProps) {
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFileMutation = useAddFile();

  const [origin, setOrigin] = useState('');
  const [type, setType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [errors, setErrors] = useState<{ origin?: string; type?: string; file?: string }>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const validateOrigin = (v: string) => (!v ? 'Selecione a origem.' : undefined);
  const validateType = (v: string) => (!v ? 'Selecione o tipo.' : undefined);

  const isTooBig = (f: File) => f.size > MAX_SIZE_MB * 1024 * 1024;

  const matchesSelectedType = (f: File, selectedType: string) => {
    if (!selectedType) return true;
    const name = f.name.toLowerCase();
    const mime = (f.type || '').toLowerCase();
    if (selectedType === 'csv') return name.endsWith('.csv') || mime.includes('text/csv');
    if (selectedType === 'pdf') return name.endsWith('.pdf') || mime === 'application/pdf';
    if (selectedType === 'xlsx')
      return (
        name.endsWith('.xlsx') ||
        mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    return true;
  };

  const validateFile = (f: File | null, selectedType: string) => {
    if (!f) return 'Envie um arquivo.';
    if (isTooBig(f)) return `Arquivo acima de ${MAX_SIZE_MB} MB.`;
    if (!matchesSelectedType(f, selectedType)) {
      if (selectedType === 'csv') return 'Tipo inválido. Envie um arquivo CSV (.csv).';
      return 'Arquivo inválido para o tipo selecionado.';
    }
    return undefined;
  };

  const validateAll = () => {
    const next = {
      origin: validateOrigin(origin),
      type: validateType(type),
      file: validateFile(file, type),
    };
    setErrors(next);
    return next;
  };

  const focusFirstInvalid = (errs: typeof errors) => {
    if (errs.origin) {
      document.getElementById(`${titleId}-origin`)?.focus();
      return;
    }
    if (errs.type) {
      document.getElementById(`${titleId}-type`)?.focus();
      return;
    }
    if (errs.file) {
      document.getElementById(`${titleId}-file`)?.focus();
    }
  };

  const accept = type ? ACCEPT_BY_TYPE[type] : Object.values(ACCEPT_BY_TYPE).join(',');

  const onChangeOrigin: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const v = e.target.value;
    setOrigin(v);
    if (submitAttempted) setErrors((prev) => ({ ...prev, origin: validateOrigin(v) }));
  };

  const onChangeType: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const v = e.target.value;
    setType(v);
    if (submitAttempted) {
      setErrors((prev) => ({
        ...prev,
        type: validateType(v),
        file: file ? validateFile(file, v) : prev.file,
      }));
    }
  };

  const handleFileInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (submitAttempted) setErrors((prev) => ({ ...prev, file: validateFile(f, type) }));
  };

  const pickFile = (f?: File) => {
    if (!f) return;
    setFile(f);
    if (submitAttempted) setErrors((prev) => ({ ...prev, file: validateFile(f, type) }));
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    pickFile(f);
  };

  const handleSubmit = async () => {
    if (!submitAttempted) setSubmitAttempted(true);
    const errs = validateAll();
    const hasError = Object.values(errs).some(Boolean);
    if (hasError || !file) {
      focusFirstInvalid(errs);
      return;
    }

    const newFile: FileRequest = {
      origin,
      file_type: type,
      file,
    };

    addFileMutation.mutate(
      { caseId, newFile },
      {
        onSuccess: () => {
          onSubmit();
          onClose();
        },
      }
    );
  };

  const showOriginError = submitAttempted && !!errors.origin;
  const showTypeError = submitAttempted && !!errors.type;
  const showFileError = submitAttempted && !!errors.file;

  return (
    <div className={styles.addfileTheme}>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Adicionar arquivo"
        size="medium"
        data-testid="modal-add-file"
      >
        <div className={`${styles.form} addfileScope`}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor={`${titleId}-origin`} className={styles.label}>
                {t('addFile.origin')}{' '}
                <span className={styles.required}>{t('addFile.required')}</span>
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id={`${titleId}-origin`}
                  className={`${styles.select} ${!origin ? styles.placeholder : ''} ${
                    showOriginError ? styles.invalid : ''
                  }`}
                  value={origin}
                  onChange={onChangeOrigin}
                  aria-invalid={showOriginError}
                  aria-describedby={showOriginError ? `${titleId}-origin-error` : undefined}
                >
                  <option value="">{t('addFile.select')}</option>
                  {ORIGIN_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <KeyboardArrowDownIcon className={styles.selectIcon} />
              </div>
              {showOriginError && (
                <p
                  id={`${titleId}-origin-error`}
                  className={styles.error}
                  role="alert"
                  aria-live="polite"
                >
                  {errors.origin}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor={`${titleId}-type`} className={styles.label}>
                {t('addFile.type')} <span className={styles.required}>{t('addFile.required')}</span>
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id={`${titleId}-type`}
                  className={`${styles.select} ${!type ? styles.placeholder : ''} ${
                    showTypeError ? styles.invalid : ''
                  }`}
                  value={type}
                  onChange={onChangeType}
                  aria-invalid={showTypeError}
                  aria-describedby={showTypeError ? `${titleId}-type-error` : undefined}
                >
                  <option value="">{t('addFile.select')}</option>
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <KeyboardArrowDownIcon className={styles.selectIcon} />
              </div>
              {showTypeError && (
                <p
                  id={`${titleId}-type-error`}
                  className={styles.error}
                  role="alert"
                  aria-live="polite"
                >
                  {errors.type}
                </p>
              )}
            </div>
          </div>

          <div className={`${styles.fieldFull} ${styles.fileBlock}`}>
            <label htmlFor={`${titleId}-file`} className={styles.label}>
              {t('addFile.file')} <span className={styles.required}>{t('addFile.required')}</span>
            </label>

            <div
              className={`${styles.dropzone} ${dragActive ? styles.dragActive : ''} ${
                showFileError ? styles.invalid : ''
              }`}
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
              onKeyDown={(e) =>
                (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()
              }
              aria-label="Selecione ou arraste o arquivo"
              aria-describedby={showFileError ? `${titleId}-file-error` : undefined}
            >
              <input
                id={`${titleId}-file`}
                ref={fileInputRef}
                type="file"
                className={styles.inputFile}
                onChange={handleFileInput}
                accept={accept}
              />
              <div className={styles.dropzoneContent}>
                <FileUploadIcon fontSize="large" />
                <span className={styles.dropzoneText}>
                  {file ? file.name : 'Selecione ou arraste o arquivo'}
                </span>
              </div>
            </div>

            {showFileError && (
              <p
                id={`${titleId}-file-error`}
                className={styles.error}
                role="alert"
                aria-live="polite"
              >
                {errors.file}
              </p>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.primaryButton} onClick={handleSubmit}>
            {t('addFile.add')}
          </button>
        </div>
      </Modal>
    </div>
  );
}
