'use client';
import React, { useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import { MdOutlineClear } from 'react-icons/md';

import Button from '../Button';
import Input from '../Input';
import styles from './Filter.module.css';
import { CustomSelect } from '../select';

export type FilterValues = {
  search?: string;
  caseNumber?: string;
  caseName?: string;
  responsible?: string;
  situation?: string;
};

export type SituationOption = { value: string; label: string };

export type FilterProps = {
  onFilter: (filters: FilterValues) => void;
  onClear?: () => void;
  defaultValues?: FilterValues;
  situations: SituationOption[];
  disabled?: boolean;
  loading?: boolean;
};

const Filter: React.FC<FilterProps> = ({
  onFilter,
  onClear,
  defaultValues = {},
  situations,
  disabled = false,
  loading = false,
}) => {
  const [filters, setFilters] = useState<FilterValues>({ ...defaultValues });

  const handleInputChange = (field: keyof FilterValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSelectChange = (field: keyof FilterValues) => (value: string | null) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value ?? undefined,
    }));
  };

  const handleFilter = () => {
    onFilter(filters);
  };

  const handleClear = () => {
    setFilters({ ...defaultValues });
    onClear && onClear();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleFilter();
  };

  function handleChange(
    _arg0: string
  ):
    | (React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> &
        ((event: React.ChangeEvent<HTMLInputElement>) => void))
    | undefined {
    return _arg0
      ? (event) =>
          setFilters((prev) => ({
            ...prev,
            [_arg0]: event.target.value,
          }))
      : undefined;
  }

  return (
    <div className={styles.filterContainer}>
      <div className={styles.fieldsRow}>
        <Input
          placeholder="Insira o número do caso"
          label="Número do caso"
          value={filters.caseNumber || ''}
          onChange={handleInputChange('caseNumber')}
          disabled={disabled}
          data-testid="case-number-input"
        />
        <Input
          placeholder="Insira o nome do caso"
          label="Nome do caso"
          value={filters.caseName || ''}
          onChange={handleInputChange('caseName')}
          disabled={disabled}
          data-testid="case-name-input"
        />
        <Input
          placeholder="Insira o responsável"
          label="Responsável"
          value={filters.responsible || ''}
          onChange={handleInputChange('responsible')}
          disabled={disabled}
          data-testid="case-responsible-input"
        />
        <div className={styles.inputWrapper}>
          <label htmlFor="situation-select" data-testid="situation-select" className={styles.label}>
            Situação
          </label>
          <CustomSelect
            options={situations}
            value={filters.situation || null}
            onChange={handleSelectChange('situation')}
            placeholder="Situação"
            style={{ height: '2.5rem', width: '11.25rem' }}
            isControlled
            data-testid="situation-select"
          />
        </div>
      </div>
      <div className={styles.actions}>
        {onClear && (
          <Button
            data-testid="clear-button"
            icon={<MdOutlineClear />}
            variant="outlined"
            size="icon"
            label={''}
            onClick={handleClear}
            className={styles.filterButton}
            disabled={disabled}
          />
        )}
        <div className={styles.filterIcon}>
          <Button
            data-testid="filter-button"
            icon={<FiFilter />}
            variant="contained"
            size="icon"
            label={''}
            onClick={handleFilter}
            className={styles.filterButton}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default Filter;
