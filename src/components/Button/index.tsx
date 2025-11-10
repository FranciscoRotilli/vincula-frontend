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
  loading?: boolean;
  loadingLabel?: string;
  loadingIcon?: React.ReactNode;
  onRemove?: () => void;
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
  loading = false,
  loadingLabel,
  loadingIcon,
  onRemove,
}) => {
  const fallbackLoadingLabel = (() => {
    if (!loading) return label;
    const normalized = label.trim().toLowerCase();
    if (normalized === 'salvar') return 'Salvando...';
    if (normalized === 'excluir') return 'Excluindo...';
    if (normalized === 'remover') return 'Removendo...';
    return `${label}...`;
  })();
  const effectiveLabel = loading ? (loadingLabel ?? fallbackLoadingLabel) : label;
  const hasLabel = !!effectiveLabel;
  const effectiveIcon = loading
    ? (loadingIcon ?? <span className={styles.spinner} aria-hidden />)
    : icon;
  const isDisabled = disabled || loading;
  const shouldHideLabel = size === 'icon' && loading;

  return (
    <button
      type={type}
      className={[
        styles.button,
        styles[variant],
        styles[size],
        isDisabled ? styles.disabled : '',
        className,
      ].join(' ')}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      data-testid={testId ?? 'button'}
    >
      {effectiveIcon && (
        <span className={hasLabel ? styles.iconWithLabel : styles.iconOnly}>{effectiveIcon}</span>
      )}
      {hasLabel && (
        <span className={shouldHideLabel ? styles.srOnly : undefined}>{effectiveLabel}</span>
      )}
      {onRemove && !loading && (
        <span className={styles.removeIcon} aria-hidden onClick={onRemove}>
          {'x'}
        </span>
      )}
    </button>
  );
};

export default Button;
