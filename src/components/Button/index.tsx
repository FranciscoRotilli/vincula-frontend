import React from 'react';

import styles from './Button.module.css';

export type ButtonProps = {
  label: string;
  icon?: React.ReactNode;
  variant?: 'contained' | 'outlined' | 'error';
  size?: 'small' | 'medium' | 'large' | 'icon';
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  'data-testid'?: string;
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
  'data-testid': testId,
}) => {
  const hasLabel = !!label;
  return (
    <button
      type={type}
      className={[
        styles.button,
        styles[variant],
        styles[size],
        disabled ? styles.disabled : '',
        className
      ].join(' ')}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
      data-testid={testId ?? 'button'}
    >
      {/* {icon && (
        <span className={hasLabel ? styles.icon : styles.iconOnly}>{icon}</span>
      )} */}
      {icon}
      {hasLabel && <span>{label}</span>}
    </button>
  );
};

export default Button;
