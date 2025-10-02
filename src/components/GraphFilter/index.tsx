'use client';

import React, { useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import { MdOutlineClear } from 'react-icons/md';

import { t } from '../../texts';
import { maskCpfCnpj, onlyNumbers } from '../../utils/functions';
import Button from '../Button';
import Input from '../Input';
import { CustomSelect } from '../Select';
import styles from './GraphFilter.module.css';

export type GraphFilterValues = {
  investigado?: string;
  cpfCnpj?: string;
  destino?: string;
  database?: string;
};

export type InvestigadoOption = { value: string; label: string };
export type DatabaseOption = { value: string; label: string };

export type GraphFilterProps = {
  onFilter: (filters: GraphFilterValues) => void;
  onClear?: () => void;
  defaultValues?: GraphFilterValues;
  investigados: InvestigadoOption[];
  databases: DatabaseOption[];
  disabled?: boolean;
};

const GraphFilter: React.FC<GraphFilterProps> = ({
  onFilter,
  onClear,
  defaultValues = {},
  investigados,
  databases,
  disabled = false,
}) => {
  const [filters, setFilters] = useState<GraphFilterValues>({ ...defaultValues });

  const handleInputChange =
    (field: keyof GraphFilterValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (field === 'cpfCnpj') {
        const digits = onlyNumbers(e.target.value);
        if (digits.length <= 14) {
          const masked = maskCpfCnpj(digits);
          setFilters((prev) => ({
            ...prev,
            [field]: masked,
          }));
        }
      } else {
        setFilters((prev) => ({
          ...prev,
          [field]: e.target.value,
        }));
      }
    };

  const handleSelectChange = (field: keyof GraphFilterValues) => (value: string | null) => {
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
    onClear?.();
  };

  return (
    <section className={styles.frame}>
      <div className={styles.row}>
        <div className={styles.groupInvestigado}>
          <label className={styles.label}>{t('graph.filter.investigated')}</label>
          <CustomSelect
            options={investigados}
            value={filters.investigado || null}
            onChange={handleSelectChange('investigado')}
            placeholder={''}
            name="investigado"
            id="investigado"
            isControlled
            style={{ maxHeight: '40px', fontSize: '14px' }}
          />
        </div>

        <div className={styles.groupCpf}>
          <label className={styles.label}>{t('graph.filter.cpfCnpj')}</label>
          <Input
            value={filters.cpfCnpj || ''}
            onChange={handleInputChange('cpfCnpj')}
            placeholder={t('graph.filter.cpfCnpjDescription')}
            height={40}
            size="small"
            variant="outlined"
            disabled={disabled}
          />
        </div>

        <div className={styles.groupDestino}>
          <label className={styles.label}>{t('graph.filter.destination')}</label>
          <Input
            value={filters.destino || ''}
            onChange={handleInputChange('destino')}
            placeholder={t('graph.filter.destinationDescription')}
            height={40}
            size="small"
            variant="outlined"
            disabled={disabled}
          />
        </div>

        <div className={styles.groupDb}>
          <label className={styles.label}>{t('graph.filter.database')}</label>
          <CustomSelect
            options={databases}
            value={filters.database || null}
            onChange={handleSelectChange('database')}
            placeholder={t('graph.filter.databaseDescription')}
            name="database"
            id="database"
            isControlled
            style={{ maxHeight: '40px', color: 'var(--text-color-placeholder)' }}
          />
        </div>

        <div className={styles.controls}>
          <Button
            icon={<FiFilter />}
            variant="outlined"
            size="icon"
            label={''}
            onClick={handleClear}
            disabled={disabled}
          />

          <Button
            icon={<FiFilter />}
            variant="contained"
            size="icon"
            label={''}
            onClick={handleFilter}
            disabled={disabled}
          />
        </div>
      </div>
    </section>
  );
};

export default GraphFilter;
