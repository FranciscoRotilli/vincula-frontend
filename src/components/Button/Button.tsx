import React from 'react';

import styles from './Button.module.css';

export type ButtonProps = {
  label: string;
  icon?: React.ReactNode;
  variant?: 'contained' | 'outlined' | 'error';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
};

const Button: React.FC<ButtonProps> = ({
  label,
  icon,
  variant = 'contained',
  size = 'medium',
  disabled = false,
  onClick,
  className = '',
  type = 'button',
}) => {
  return (
    <button
      type={type}
      className={[styles.button, styles[variant], styles[size], disabled ? styles.disabled : '', className].join(' ')}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span>{label}</span>
    </button>
  );
};

export default Button;
