'use client';
import React, { useState } from 'react';
import { FiFilter, FiSearch } from 'react-icons/fi';

import Button from '../Button/Button';
import Input from '../input/Input';
import styles from './Filter.module.css';

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

  const handleInputChange =
    (field: keyof FilterValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSelectChange =
    (field: keyof FilterValues) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters((prev) => ({
        ...prev,
        [field]: e.target.value,
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
      <div className={styles.topRow}>
        <div className={styles.inputWrapper} style={{ flex: 1 }}>
          <label className={styles.visuallyHidden} htmlFor="search-input">
            Buscar
          </label>
          <Input
            id="search-input"
            placeholder="Buscar..."
            value={filters.search || ''}
            onChange={handleChange('search')}
            startIcon={<FiSearch />}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
        </div>
        <Button
          icon={<FiFilter />}
          variant="contained"
          size="icon"
          label={''}
          onClick={handleFilter} // Corrija aqui!
          className={styles.filterButton}
          disabled={disabled}    // Corrija aqui!
        />
      </div>
      <div className={styles.fieldsRow}>
        <div className={styles.inputWrapper}>
          <Input
            placeholder="Insira o número do caso"
            label="Número do caso"
            value={filters.caseNumber || ''}
            onChange={handleInputChange('caseNumber')}
            disabled={disabled}
          />
        </div>
        <div className={styles.inputWrapper}>
          <Input
            placeholder="Insira o nome do caso"
            label="Nome do caso"
            value={filters.caseName || ''}
            onChange={handleInputChange('caseName')}
            disabled={disabled}
          />
        </div>
        <div className={styles.inputWrapper}>
          <Input
            placeholder="Insira o responsável"
            label="Responsável"
            value={filters.responsible || ''}
            onChange={handleInputChange('responsible')}
            disabled={disabled}
          />
        </div>
        <div className={styles.inputWrapper}>
          <label htmlFor="situation-select">
            Situação
          </label>
          <select
            id="situation-select"
            className={styles.select}
            value={filters.situation || ''}
            onChange={handleSelectChange('situation')}
            disabled={disabled}
          >
            <option value="">Selecione a situação</option>
            {situations.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {onClear && (
        <button className={styles.clearButton} onClick={handleClear} disabled={disabled} type="button">
          Limpar filtros
        </button>
      )}
    </div>
  );
};

export default Filter;
