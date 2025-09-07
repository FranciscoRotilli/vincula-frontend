import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { describe, expect, it, vi } from 'vitest';

import Button from '../../../src/components/Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Test" onClick={() => {}} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(<Button label="Edit" icon={<FiEdit2 data-testid="icon" />} onClick={() => {}} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    const { rerender } = render(<Button label="Contained" variant="contained" onClick={() => {}} />);
    expect(screen.getByRole('button').className).toContain('contained');
    rerender(<Button label="Outlined" variant="outlined" onClick={() => {}} />);
    expect(screen.getByRole('button').className).toContain('outlined');
    rerender(<Button label="Error" variant="error" onClick={() => {}} />);
    expect(screen.getByRole('button').className).toContain('error');
  });

  it('applies size classes', () => {
    const { rerender } = render(<Button label="Small" size="small" onClick={() => {}} />);
    expect(screen.getByRole('button').className).toContain('small');
    rerender(<Button label="Medium" size="medium" onClick={() => {}} />);
    expect(screen.getByRole('button').className).toContain('medium');
    rerender(<Button label="Large" size="large" onClick={() => {}} />);
    expect(screen.getByRole('button').className).toContain('large');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button label="Click" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button label="Disabled" onClick={handleClick} disabled />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
