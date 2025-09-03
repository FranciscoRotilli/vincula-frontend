"use client"
import React, { useState } from 'react';
/////// import * as SelectPrimitive from '@radix-ui/react-select';
import { KeyboardArrowDown, KeyboardArrowUp, Clear } from '@mui/icons-material';
import clsx from 'clsx'; 

import styles from './Select.module.css'; 


export type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

interface SelectProps {
  options: Option[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  placeholder?: string;
  label?: string;
  error?: string | boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
  required?: boolean;
  allowClear?: boolean;
  size?: 'sm' | 'md';
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  name,
  id,
  required,
  allowClear = false,
  size = 'md',
}) => {
  
  const [internalValue, setInternalValue] = useState(defaultValue || null);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleValueChange = (newValue: string) => {
    if (!isControlled) setInternalValue(newValue);
    if (onChange) onChange(newValue);
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!isControlled) setInternalValue(null);
    if (onChange) onChange(null);
  };

  const selectedOptionLabel = options.find((opt) => opt.value === currentValue)?.label;

  return (
    <div className={styles.selectWrapper}>
      {label && <label className={styles.label} htmlFor={id}>{label}</label>}
    <select className={styles.Brian}>
        <option disabled selected>{placeholder}</option>

       {
        options.map((option) => {
            return (<option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)
        })
       }
    </select>
    
      </div>
    
  );
};