'use client';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';

import styles from './MultiSelectDropdown.module.css';

export type Option = { value: string; label: string };

export type MultiSelectDropdownProps = {
  options: Option[];
  defaultSelected?: string[];
  onChange?: (values: string[]) => void;

  placeholder?: string;
  maxVisibleOptions?: number;
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
  maxVisibleOptions = 6.5,
  disabled = false,
  id,
  className,
  ariaLabel = 'Seleção múltipla',
}: MultiSelectDropdownProps) {
  const reactId = useId();
  const baseId = (id ?? `msd-${reactId}`).replace(/\s+/g, '-');

  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const [expanded, setExpanded] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const defaultSelectedStr = JSON.stringify(defaultSelected);
  useEffect(() => {
    const newDefaults = JSON.parse(defaultSelectedStr) as string[];
    setSelected(newDefaults);
  }, [defaultSelectedStr]);

  useEffect(() => {
    if (!expanded) return;
    const onDocClick = (e: MouseEvent) => {
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) setExpanded(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [expanded]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggleExpanded = () => !disabled && setExpanded((v) => !v);

  const toggleItem = (val: string) => () => {
    setSelected((prev) => {
      const has = prev.includes(val);
      const next = has ? prev.filter((v) => v !== val) : [...prev, val];
      onChange?.(next);
      return next;
    });
  };

  const removeTag = (val: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected((prev) => {
      const next = prev.filter((v) => v !== val);
      onChange?.(next);
      return next;
    });
  };

  const menuMaxHeight = `calc(1.313rem * ${maxVisibleOptions} + 8px)`;

  const buttonId = `${baseId}-button`;
  const listboxId = `${baseId}-listbox`;

  return (
    <div
      ref={rootRef}
      id={baseId}
      className={`${styles.root} ${className || ''} ${disabled ? styles.isDisabled : ''}`}
    >
      <div
        id={buttonId}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={expanded}
        aria-controls={listboxId}
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
        data-testid={`${baseId}-field`}
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
                    data-testid={`${baseId}-chip-remove-${val}`}
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
          id={listboxId}
          className={styles.menu}
          role="listbox"
          aria-label={ariaLabel}
          aria-labelledby={buttonId}
          style={{ maxHeight: menuMaxHeight }}
          data-testid={`${baseId}-listbox`}
        >
          <ul className={styles.list}>
            {options.map((opt, idx) => {
              const checked = selectedSet.has(opt.value);
              const optionId = `${baseId}-opt-${idx}`;
              return (
                <li key={opt.value} id={optionId}>
                  <button
                    type="button"
                    className={styles.optionRow}
                    onClick={toggleItem(opt.value)}
                    role="option"
                    aria-selected={checked}
                    aria-describedby={optionId}
                    data-testid={`${baseId}-option-${opt.value}`}
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
