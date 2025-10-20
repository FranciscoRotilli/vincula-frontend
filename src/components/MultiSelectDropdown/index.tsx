'use client';

import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
//import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import React, { useEffect, useMemo, useState } from 'react';

import styles from './MultiSelectDropdown.module.css';

export type Option = { value: string; label: string };

export type MultiSelectDropdownProps = {
  options: Option[];
  defaultSelected?: string[];
  onChange?: (values: string[]) => void;

  placeholder?: string;
  maxVisibleOptions?: number;
  width?: string | number;
  disabled?: boolean;
  id?: string;
  className?: string;
  ariaLabel?: string;
};

export default function MultiSelectDropdown({
  options,
  defaultSelected = [],
  onChange,
  placeholder = 'Selecionar',
  maxVisibleOptions = 3,
  width = '32.438rem',
  disabled = false,
  id,
  className,
  ariaLabel = 'Seleção múltipla',
}: MultiSelectDropdownProps) {
  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const [expanded, setExpanded] = useState(false);

  const rootId = id || '__msd-root';

  useEffect(() => {
    if (!expanded) return;
    const root = document.getElementById(rootId);
    const onDocClick = (e: MouseEvent) => {
      if (root && !root.contains(e.target as Node)) setExpanded(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [expanded, rootId]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggleExpanded = () => !disabled && setExpanded(v => !v);

  const toggleItem = (val: string) => () => {
    setSelected(prev => {
      const next = selectedSet.has(val) ? prev.filter(v => v !== val) : [...prev, val];
      onChange?.(next);
      return next;
    });
  };

  const removeTag = (val: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(prev => {
      const next = prev.filter(v => v !== val);
      onChange?.(next);
      return next;
    });
  };

  const menuMaxHeight = `calc(1.313rem * ${maxVisibleOptions} + 8px)`;

  return (
    <div
      id={rootId}
      className={`${styles.root} ${className || ''} ${disabled ? styles.isDisabled : ''}`}
      style={{ width }}
    >
      <div
        id={`${rootId}-button`}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={expanded}
        aria-disabled={disabled || undefined}
        className={styles.field}
        onClick={toggleExpanded}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpanded();
          }
          if (e.key === 'Escape') setExpanded(false);
        }}
      >
        <div className={styles.chips} role="presentation">
          {selected.length === 0 ? (
            <span className={styles.placeholder}>{placeholder}</span>
          ) : (
            selected.map((val) => {
              const opt = options.find((o) => o.value === val);
              const text = opt?.label ?? val;
              return (
                <span key={val} className={styles.chip}>
                  <span className={styles.chipText}>{text}</span>
                  <button
                    type="button"
                    aria-label={`Remover ${text}`}
                    className={styles.chipClose}
                    onClick={removeTag(val)}
                    tabIndex={-1}
                  >
                    ×
                  </button>
                </span>
              );
            })
          )}
        </div>
        <ArrowDropDownIcon className={expanded ? styles.iconRotated : styles.icon} />
      </div>

      {expanded && (
        <div
          className={styles.menu}
          role="listbox"
          aria-label={ariaLabel}
          style={{ maxHeight: menuMaxHeight }}
        >
          <ul className={styles.list}>
            {options.map(opt => {
              const checked = selectedSet.has(opt.value);
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    className={styles.optionRow}
                    onClick={toggleItem(opt.value)}
                    role="option"
                    aria-selected={checked}
                  >
                    <span
                      className={`${styles.checkboxIcon} ${checked ? styles.checked : ''}`}
                      aria-hidden
                    >
                      {checked ? <CheckBoxRoundedIcon /> : <CheckBoxOutlineBlankRoundedIcon />}
                    </span>
                    <span className={styles.optionText} title={opt.label}>
                      {opt.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
