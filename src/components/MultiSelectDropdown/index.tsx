'use client';

import React, { useMemo, useState } from 'react';
import styles from './MultiSelectDropdown.module.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';

export type Option = { value: string; label: string };

export type MultiSelectDropdownProps = {
  open: boolean;
  onClose: () => void;
  optionsA: Option[];
  optionsB: Option[];
  initialSelectedA?: string[];
  initialSelectedB?: string[];
  onConfirm?: (sel: { a: string[]; b: string[] }) => void;
  labelA?: string;
  labelB?: string;
  confirmText?: string;
  cancelText?: string;
};

export default function MultiSelectDropdown({
  open,
  onClose,
  optionsA,
  optionsB,
  initialSelectedA = [],
  initialSelectedB = [],
  onConfirm,
  labelA = 'Rótulo',
  labelB = 'Rótulo',
  confirmText = 'Aplicar',
  cancelText = 'Cancelar',
}: MultiSelectDropdownProps) {
  const [expandedA, setExpandedA] = useState(false);
  const [expandedB, setExpandedB] = useState(false);
  const [selectedA, setSelectedA] = useState<string[]>(initialSelectedA);
  const [selectedB, setSelectedB] = useState<string[]>(initialSelectedB);

  const toggleExpandedA = () => setExpandedA((v) => !v);
  const toggleExpandedB = () => setExpandedB((v) => !v);

  const handleToggleA = (val: string) => () =>
    setSelectedA((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));
  const handleToggleB = (val: string) => () =>
    setSelectedB((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));

  const summaryA = useMemo(() => (selectedA.length ? `${selectedA.length} selecionada(s)` : 'Selecionar'), [selectedA]);
  const summaryB = useMemo(() => (selectedB.length ? `${selectedB.length} selecionada(s)` : 'Selecionar'), [selectedB]);

  const confirm = () => {
    onConfirm?.({ a: selectedA, b: selectedB });
    onClose();
  };

  if (!open) return null;

  return (
    <div className={styles['msd-backdrop']} role="dialog" aria-modal="true" aria-labelledby="msd-title">
      <div className={styles['msd-modal']}>
        <button className={styles['msd-close']} aria-label="Fechar" onClick={onClose}>
          ×
        </button>

        <div className={styles['msd-content']}>
          {/* Dropdown A */}
          <div className={styles['msd-block']}>
            <div className={styles['msd-labelBox']}>
              <span id="msd-label-a" className={styles['msd-label']}>
                {labelA}
              </span>
            </div>

            <button
              type="button"
              className={styles['msd-dropdownHeader']}
              aria-expanded={expandedA}
              aria-controls="msd-dd-a"
              onClick={toggleExpandedA}
            >
              <span className={styles['msd-dropdownText']}>{summaryA}</span>
              <ExpandMoreIcon className={expandedA ? styles['msd-iconRotated'] : styles['msd-icon']} />
            </button>

            {expandedA && (
              <div id="msd-dd-a" className={styles['msd-dropdownContent']} role="region" aria-labelledby="msd-label-a">
                <div className={styles['msd-scrollArea']}>
                  <ul className={styles['msd-list']}>
                    {optionsA.map((opt) => {
                      const checked = selectedA.includes(opt.value);
                      return (
                        <li key={opt.value}>
                          <button type="button" className={styles['msd-optionRow']} onClick={handleToggleA(opt.value)}>
                            <span className={styles['msd-checkboxIcon']} aria-hidden>
                              {checked ? <CheckBoxRoundedIcon /> : <CheckBoxOutlineBlankRoundedIcon />}
                            </span>
                            <span className={styles['msd-optionText']} title={opt.label}>
                              {opt.label}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Dropdown B */}
          <div className={styles['msd-block']}>
            <div className={styles['msd-labelBox']}>
              <span id="msd-label-b" className={styles['msd-label']}>
                {labelB}
              </span>
            </div>

            <button
              type="button"
              className={styles['msd-dropdownHeader']}
              aria-expanded={expandedB}
              aria-controls="msd-dd-b"
              onClick={toggleExpandedB}
            >
              <span className={styles['msd-dropdownText']}>{summaryB}</span>
              <ExpandMoreIcon className={expandedB ? styles['msd-iconRotated'] : styles['msd-icon']} />
            </button>

            {expandedB && (
              <div id="msd-dd-b" className={styles['msd-dropdownContent']} role="region" aria-labelledby="msd-label-b">
                <div className={styles['msd-scrollArea']}>
                  <ul className={styles['msd-list']}>
                    {optionsB.map((opt) => {
                      const checked = selectedB.includes(opt.value);
                      return (
                        <li key={opt.value}>
                          <button type="button" className={styles['msd-optionRow']} onClick={handleToggleB(opt.value)}>
                            <span className={styles['msd-checkboxIcon']} aria-hidden>
                              {checked ? <CheckBoxRoundedIcon /> : <CheckBoxOutlineBlankRoundedIcon />}
                            </span>
                            <span className={styles['msd-optionText']} title={opt.label}>
                              {opt.label}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className={styles['msd-spacer']} />

          <div className={styles['msd-footer']}>
            <button className={styles['msd-btnText']} onClick={onClose}>
              {cancelText}
            </button>
            <button className={styles['msd-btnPrimary']} onClick={confirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
