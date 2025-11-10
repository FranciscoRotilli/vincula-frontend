'use client';
import { FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import React, { useState } from 'react';

import styles from './Select.module.css';

export type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

interface SelectProps {
  options: Option[];
  value?: string | null;
  onChange: (value: string | null) => void;
  placeholder: string;
  name?: string;
  id?: string;
  required?: boolean;
  isControlled?: boolean;
  style?: React.CSSProperties;
  testId?: string;
}

export const CustomSelect: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  name,
  id,
  required,
  isControlled = false,
  style,
  testId
}) => {
  const [internalValue, setInternalValue] = useState<string>('');

  const handleValueChange = (event: SelectChangeEvent<string>) => {
    const newValue = event.target.value === '' ? null : event.target.value;
    if (!isControlled) {
      setInternalValue(event.target.value);
    }
    onChange(newValue);
  };

  const selectValue = isControlled
  ? value ?? ''
  : internalValue ?? '';

  return (
    <FormControl fullWidth>
      <Select
        id={id}
        name={name}
        value={selectValue}
        onChange={handleValueChange}
        required={required}
        sx={style}
        displayEmpty
        data-testid={testId}
        MenuProps={{
          disablePortal: true,
          disableScrollLock: true,
          PaperProps: {
            style: {
              zIndex: 1500,
            },
          },
          sx: { zIndex: 10001 },
        }}
        renderValue={(selected) => {
          if (selected === '') {
            return <span className={styles.placeholder}>{placeholder}</span>;
          }
          return selected;
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
