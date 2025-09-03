"use client"
import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';

export type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

interface SelectProps {
  options: Option[];
  value?: string | null;
  onChange: (value: string | null) => void;
  label: string;
  name?: string;
  id?: string;
  required?: boolean;
  isControlled?: boolean;
}

export const CustomSelect: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  label,
  name,
  id,
  required,
  isControlled = false,
}) => {
  const [internalValue, setInternalValue] = useState<string>("");

  const handleValueChange = (event: SelectChangeEvent<string | null>) => {
    const newValue = event.target.value === "" ? null : event.target.value;
    if (!isControlled) {
      setInternalValue(event.target.value!);
    }
    onChange(newValue);
  };

  const selectValue = isControlled ? value ?? "" : internalValue;

  return (
      <FormControl fullWidth>
        <InputLabel id={id}>
          {label}
        </InputLabel>
        <Select
          labelId={id}
          id={id}
          name={name}
          value={selectValue}
          label={label}
          onChange={handleValueChange}
          required={required}
        >
          {options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
  );
};