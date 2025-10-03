'use client';
import React, { useState } from 'react';
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
  defaultValues?: FilterValues;
  disabled?: boolean;
  customStyles?: {
    container?: string;
  };
};

const Filter: React.FC<FilterProps> = ({
  fields,
  onFilter,
  onClear,
  defaultValues = {},
  disabled = false,
  customStyles = {},
}) => {
  const [filters, setFilters] = useState<FilterValues>({ ...defaultValues });

  const handleInputChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSelectChange = (key: string) => (value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: value ?? undefined }));
  };

  const handleFilter = () => {
    onFilter(filters);
  };

  const handleClear = () => {
    setFilters({ ...defaultValues });
    onClear?.();
  };

  return (
    <div className={`${styles.filterContainer} ${customStyles?.container || ''}`} data-testid="filter-component">
      <div className={styles.fieldsRow}>
        {fields.map((field) =>
          field.type === 'input' ? (
            <Input
              key={field.key}
              placeholder={field.placeholder}
              label={field.label}
              value={filters[field.key] || ''}
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
              <label className={styles.label}>
                {field.label}
              </label>
              <CustomSelect
                options={field.options || []}
                value={(filters[field.key] as string) || null}
                onChange={handleSelectChange(field.key)}
                placeholder={field.placeholder}
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
            className={`${styles.filterButton} ${customStyles?.clearButton || ''}`}
            disabled={disabled}
          />
        )}
        <div className={styles.filterIcon}>
          <Button
            data-testid="filter-button"
            icon={<FiFilter />}
            variant="contained"
            size="icon"
            label=""
            onClick={handleFilter}
            className={`${styles.filterButton} ${customStyles?.filterButton || ''}`}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default Filter;
