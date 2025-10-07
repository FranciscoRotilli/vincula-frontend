'use client';
import React, { useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import { MdOutlineClear } from 'react-icons/md';

import { CaseStatus } from '@/types/Cases';
import { maskCpfCnpj, onlyNumbers } from '@/utils/functions';

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
	isCpfCnpjField?: boolean;
};

export type FilterProps = {
  fields: FieldConfig[];
  onFilter: (filters: FilterValues) => void;
  onClear?: () => void;
  defaultValues?: FilterValues;
  disabled?: boolean;
  customStyles?: {
    container?: string;
    inputWrapper?: string;
    actions?: string;
    filterButton?: string;
    clearButton?: string;
  };
};

const isCaseStatus = (value: string): value is CaseStatus => {
  return ['Aberto', 'Em andamento', 'Concluído'].includes(value);
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
    const value = e.target.value;
    const field = fields.find(f => f.key === key);
    
    let processedValue = value;
    if (field?.isCpfCnpjField) {
      const digits = onlyNumbers(value);
      if (digits.length <= 14) {
        processedValue = maskCpfCnpj(digits);
      } else {
        return;
      }
    }
    
    setFilters((prev) => ({ ...prev, [key]: processedValue }));
  };

  const handleSelectChange = (key: string) => (value: string | null) => {
  setFilters((prev) => ({
    ...prev,
    [key]: value && value !== '' ? value : undefined,
  }));
};

  const handleFilter = () => {
    let isValid = true;
    
    for (const field of fields) {
      if (field.isCpfCnpjField && filters[field.key]) {
        const digits = onlyNumbers(filters[field.key] as string);
        if (digits.length !== 11 && digits.length !== 14) {
          isValid = false;
          break;
        }
      }
    }
    
    if (isValid) {
      onFilter(filters);
    }
  };

  const handleClear = () => {
    setFilters({ ...defaultValues });
    onClear?.();
  };

  return (
    <div
      className={`${styles.filterContainer} ${customStyles?.container || ''}`}
      data-testid="filter-component"
    >
      <div className={styles.fieldsRow}>
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
