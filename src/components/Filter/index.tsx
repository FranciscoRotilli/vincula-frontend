'use client';
import React, { useEffect, useRef, useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import { MdOutlineClear } from 'react-icons/md';

import { CaseStatus } from '@/types/Cases';

import Button from '../Button';
import Input from '../Input';
import MultiSelectDropdown from '../MultiSelectDropdown';
import { CustomSelect } from '../Select';
import styles from './Filter.module.css';
import { Save } from '@mui/icons-material';
import { usePathname } from 'next/navigation';
import SaveFilterModal from '../Modals/SaveFilterModal';

export type FilterValues = {
  caseNumber?: string;
  caseName?: string;
  responsible?: string;
  situation?: CaseStatus;
  search?: string;
  [key: string]: string | string[] | CaseStatus | undefined;
};

export type FieldConfig = {
  key: string;
  label: string;
  placeholder?: string;
  type: 'input' | 'select' | 'multi-select';
  options?: { value: string; label: string }[];
  testId?: string;
  isCpfCnpjField?: boolean;
};

export type FilterProps = {
  fields: FieldConfig[];
  onFilter: (filters: FilterValues) => void;
  onClear?: () => void;
  onSaveFilter?: (filters: FilterValues) => void;
  defaultValues?: FilterValues;
  values?: FilterValues;
  onValuesChange?: (values: FilterValues) => void;
  graphFilter?: boolean;
  disabled?: boolean;
  autoFilter?: boolean;
  debounceMs?: number;
  validateField?: (key: string, value: string) => string | undefined;
  customStyles?: {
    container?: string;
    fieldsRow?: string;
    inputWrapper?: string;
    actions?: string;
  };
};

type SavedFilter = {
  name: string;
  values: FilterValues;
  createdAt?: string;
};

const _isCaseStatus = (value: string): value is CaseStatus => {
  return ['Aberto', 'Em andamento', 'Concluído'].includes(value);
};

const Filter: React.FC<FilterProps> = ({
  fields,
  onFilter,
  onClear,
  defaultValues = {},
  values: controlledValues,
  onValuesChange,
  graphFilter = false,
  disabled = false,
  autoFilter = false,
  debounceMs = 2000,
  validateField,
  customStyles = {},
}) => {
  const isControlled = controlledValues !== undefined && onValuesChange !== undefined;
  const [internalFilters, setInternalFilters] = useState<FilterValues>({ ...defaultValues });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [selectedSavedFilter, setSelectedSavedFilter] = useState<string>('');
  const [isSaveFilterModalOpen, setIsSaveFilterModalOpen] = useState<boolean>(false);
  const filters = isControlled ? controlledValues : internalFilters;

  const updateFilters = (updater: FilterValues | ((prev: FilterValues) => FilterValues)) => {
    if (isControlled && onValuesChange) {
      if (typeof updater === 'function') {
        onValuesChange(updater(controlledValues));
      } else {
        onValuesChange(updater);
      }
    } else {
      setInternalFilters(updater);
    }
  };

  useEffect(() => {
    if (!autoFilter) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onFilter(filters);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [filters, autoFilter, debounceMs, onFilter]);

  const handleInputChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateFilters((prev) => ({ ...prev, [key]: value }));
    
    if (selectedSavedFilter !== '') setSelectedSavedFilter('');

    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (key: string, multi = false) => (value: string | null | string[]) => {
    const newFilters = {
      ...filters,
      [key]: multi ? (value as string[]) : (value && value !== '' ? (value as string) : undefined),
    };
    updateFilters(newFilters);
    
    if (selectedSavedFilter !== '') setSelectedSavedFilter('');

    if (autoFilter) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      onFilter(newFilters);
    }
  };

  const safeParse = <T,>(json: string | null): T | null => {
    try {
      return json ? (JSON.parse(json) as T) : null;
    } catch {
      return null;
    }
  };
  const pathname = usePathname();
  const STORAGE_KEY = `graphFilters_${pathname}`;

  const getSavedFilters = () => {
    const parsed = safeParse<SavedFilter[]>(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(parsed)) setSavedFilters(parsed);
  };

  const addSavedFilters = (filter: SavedFilter) => {
    const parsed = safeParse<SavedFilter[]>(localStorage.getItem(STORAGE_KEY)) ?? [];
    parsed.push(filter);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    setSavedFilters(parsed);
  };

  useEffect(() => {
    getSavedFilters();

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) getSavedFilters();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const applySavedFilter = (sf: SavedFilter) => {
    const allowedKeys = new Set(fields.map(f => f.key));
    const next: FilterValues = {};

    Object.entries(sf.values).forEach(([k, v]) => {
      if (!allowedKeys.has(k)) return;
      if (typeof v === 'string' && _isCaseStatus(v)) {
        next[k] = v as CaseStatus;
      } else {
        next[k] = v as any;
      }
    });

    updateFilters(next);

    if (autoFilter) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      onFilter(next);
    }
  };

  const handleSaveFilter = (name: string) => {
    
    if (name && name.trim()) {
      addSavedFilters({ name: name.trim(), values: filters, createdAt: new Date().toISOString() });
      setSelectedSavedFilter(name.trim());
    }
  };

  const handleFilter = () => {
    if (validateField) {
      const newErrors: Record<string, string> = {};
      
      fields.forEach((field) => {
        const value = filters[field.key];
        if (value && typeof value === 'string') {
          const error = validateField(field.key, value);
          if (error) {
            newErrors[field.key] = error;
          }
        }
      });
      
      setErrors(newErrors);
      
      if (Object.keys(newErrors).length > 0) {
        return;
      }
    }
    
    onFilter(filters);
  };

  const handleClear = () => {
    updateFilters({ ...defaultValues });
    setErrors({});
    onClear?.();
  };

  return (
    <div
      className={`${styles.filterContainer} ${customStyles?.container || ''}`}
      data-testid="filter-component"
    >
      <div className={`${styles.fieldsRow} ${customStyles?.fieldsRow || ''}`}>
        {fields.map((field) => {
          const multiSelected = Array.isArray(filters[field.key])
            ? (filters[field.key] as string[])
            : [];

          if (field.type === 'input') {
            return (
              <Input
                key={field.key}
                placeholder={field.placeholder ?? ''}
                label={field.label}
                value={(filters[field.key] as string | undefined) ?? ''}
                onChange={handleInputChange(field.key)}
                disabled={disabled}
                error={errors[field.key]}
                data-testid={field.testId || `${field.key}-input`}
              />
            );
          }

          if (field.type === 'multi-select') {
            return (
              <div
                key={field.key}
                className={`${styles.inputWrapper} ${customStyles?.inputWrapper || ''}`}
                data-testid={field.testId || `${field.key}-multiselect`}
              >
                <label className={styles.label}>{field.label}</label>
                <MultiSelectDropdown
                  options={field.options || []}
                  defaultSelected={multiSelected}
                  onChange={handleSelectChange(field.key, true)}
                  placeholder={field.placeholder ?? ''}
                  id={field.key}
                />
              </div>
            );
          }

          return (
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
          );
        }
        )}
          <div className={`${styles.inputWrapper} ${customStyles?.inputWrapper || ''}`}>
            <label className={styles.label}>Filtro</label>
            <CustomSelect
              options={savedFilters.map(f => ({ value: f.name, label: f.name }))}
              value={selectedSavedFilter}
              onChange={(name) => {
                const chosen = savedFilters.find(f => f.name === name);
                setSelectedSavedFilter(name || '');
                if (chosen) applySavedFilter(chosen);
              }}
              placeholder='Filtro'
              style={{ height: '2.5rem', width: '11.25rem' }}
              isControlled
            />
          </div>
        
      </div>

      <div className={`${styles.actions} ${customStyles?.actions || ''}`}>    
        {graphFilter && (
          <Button
            data-testid="save-filter-button"
            icon={<Save />}
            variant="contained"
            size="icon"
            label=""
            onClick={() => {setIsSaveFilterModalOpen(true)}}
            className={styles.iconButton}
            disabled={disabled}
          />
        )}
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

          {/* {onSaveFilter && showSaveButton && (
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
          )} */}
        </div>
      </div>
      <SaveFilterModal
        isOpen={isSaveFilterModalOpen}
        onClose={() => setIsSaveFilterModalOpen(false)}
        onSubmit={(payload) => {handleSaveFilter(payload.filterName)}}
      />
    </div>
  );
};


export default Filter;
