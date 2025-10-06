'use client';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import React, { useEffect, useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import { MdOutlineClear } from 'react-icons/md';

import { CaseStatus } from '@/types/Cases';

import Button from '../Button';
import Input from '../Input';
import { CustomSelect } from '../Select';
import styles from './Filter.module.css';

export type FilterValues = {
  caseNumber?: string;
  caseName?: string;
  responsible?: string;
  situation?: CaseStatus;
  search?: string;
  [key: string]: string | CaseStatus | undefined;
};

export type FieldConfig = {
  key: string;
  label: string;
  placeholder?: string;
  type: 'input' | 'select';
  options?: { value: string; label: string }[];
  testId?: string;
};

export type FilterProps = {
  fields: FieldConfig[];
  onFilter: (filters: FilterValues) => void;
  onClear?: () => void;
  onSaveFilter?: (filters: FilterValues) => void;
  defaultValues?: FilterValues;
  disabled?: boolean;
  customStyles?: {
    container?: string;
    fieldsRow?: string;
    inputWrapper?: string;
    actions?: string;
  };
};

const isCaseStatus = (value: string): value is CaseStatus => {
  return ['Aberto', 'Em andamento', 'Concluído'].includes(value);
};

const Filter: React.FC<FilterProps> = ({
  fields,
  onFilter,
  onClear,
  onSaveFilter,
  defaultValues = {},
  disabled = false,
  customStyles = {},
}) => {
  const [filters, setFilters] = useState<FilterValues>({ ...defaultValues });
  const [showSaveButton, setShowSaveButton] = useState(false);

  useEffect(() => {
    const hasActiveFilter = Object.values(filters).some(
      (v) => typeof v === 'string' && v.trim() !== ''
    );
    setShowSaveButton(hasActiveFilter);
  }, [filters]);

  const handleInputChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSelectChange = (key: string) => (value: string | null) => {
  setFilters((prev) => ({
    ...prev,
    [key]: value && value !== '' ? value : undefined,
  }));
};

  const handleFilter = () => {
    onFilter(filters);
  };

  const handleClear = () => {
    setFilters({ ...defaultValues });
    setShowSaveButton(false);
    onClear?.();
  };

  const handleSave = () => {
    if (onSaveFilter) onSaveFilter(filters);
  };

  return (
    <div
      className={`${styles.filterContainer} ${customStyles?.container || ''}`}
      data-testid="filter-component"
    >
      <div className={`${styles.fieldsRow} ${customStyles?.fieldsRow || ''}`}>
        {fields.map((field) =>
          field.type === 'input' ? (
            <Input
              key={field.key}
              placeholder={field.placeholder ?? ''}
              label={field.label}
              value={(filters[field.key] as string | undefined) ?? ''}
              onChange={handleInputChange(field.key)}
              disabled={disabled}
              data-testid={field.testId || `${field.key}-input`}
            />
          ) : (
            <div
              key={field.key}
              className={`${styles.inputWrapper} ${customStyles?.inputWrapper || ''}`}
              data-testid={field.testId || `${field.key}-select`}
            >
              <label className={styles.label}>{field.label}</label>
              <CustomSelect
                options={field.options || []}
                value={(filters[field.key] as string | undefined) ?? ''}
                onChange={handleSelectChange(field.key)}
                placeholder={field.placeholder ?? ''}
                style={{ height: '2.5rem', width: '11.25rem' }}
                isControlled
              />
            </div>
          )
        )}
      </div>

      <div className={`${styles.actions} ${customStyles?.actions || ''}`}>
        {onClear && (
          <Button
            data-testid="clear-button"
            icon={<MdOutlineClear />}
            variant="outlined"
            size="icon"
            label=""
            onClick={handleClear}
            className={styles.iconButton}
            disabled={disabled}
          />
        )}
        <div className={styles.saveFilter}>
          <Button
            data-testid="filter-button"
            icon={<FiFilter />}
            variant="contained"
            size="icon"
            label=""
            onClick={handleFilter}
            className={styles.iconButton}
            disabled={disabled}
          />

          {onSaveFilter && showSaveButton && (
            <Button
              data-testid="save-filter-button"
              icon={<BookmarkAddIcon />}
              variant="contained"
              size="icon"
              label=""
              onClick={handleSave}
              className={styles.iconButton}
              disabled={disabled}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Filter;
