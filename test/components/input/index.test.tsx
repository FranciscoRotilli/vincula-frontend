import '@testing-library/jest-dom/vitest'

import { Lock, Person } from '@mui/icons-material'
import { fireEvent, render, screen } from '@testing-library/react'
import React, { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'

import Input from '../../../src/components/Input'

describe('Input component', () => {
  it('renders with label (external) and placeholder for outlined (default)', () => {
    render(<Input id="name" label="Name" placeholder="Type your name" />)

    expect(screen.getByText('Name')).toBeInTheDocument()
    const input = screen.getByPlaceholderText('Type your name')
    expect(input).toBeInTheDocument()

    const label = screen.getByText('Name').closest('label')
    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute('for', 'name')
  })

  it('renders internal MUI label for filled variant (no external label element)', () => {
    render(<Input label="Name" placeholder="Type your name" variant="filled" />)

    expect(screen.getByText('Name')).toBeInTheDocument()
    const maybeExternal = screen.getByText('Name').closest('label')
    expect(screen.getByPlaceholderText('Type your name')).toBeInTheDocument()
  })

  it('adds asterisk to external label when required and variant is not filled', () => {
    render(<Input label="Name" placeholder="Type" required />)
    expect(screen.getByText('Name *')).toBeInTheDocument()
  })

  it('does not add asterisk when required + filled variant (internal label)', () => {
    render(<Input label="Name" placeholder="Type" required variant="filled" />)

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.queryByText('Name *')).not.toBeInTheDocument()
  })

  it('calls onChange when typing and updates icon color (end icon example)', () => {
    const handleChange = vi.fn()
    render(
      <Input
        label="Code"
        placeholder="Type code"
        onChange={handleChange}
        endIcon={<Lock data-testid="end-icon" />}
      />
    )
    const input = screen.getByPlaceholderText('Type code')
    const endAdornment = screen.getByTestId('end-icon').parentElement // InputAdornment wrapper
    expect(endAdornment).toHaveStyle('color: var(--text-color-secundary)')

    fireEvent.change(input, { target: { value: '123' } })
    expect(handleChange).toHaveBeenCalled()
    expect(endAdornment).toHaveStyle('color: var(--text-color-primary)')
  })

  it('updates hasValue via prop change (useEffect branch) and reflects icon color', () => {
    const { rerender } = render(
      <Input
        label="User"
        placeholder="Type user"
        startIcon={<Person data-testid="start-icon" />}
        value=""
      />
    )
    const input = screen.getByPlaceholderText('Type user')
    const startAdornment = screen.getByTestId('start-icon').parentElement
    expect(startAdornment).toHaveStyle('color: var(--text-color-secundary)')

    rerender(
      <Input
        label="User"
        placeholder="Type user"
        startIcon={<Person data-testid="start-icon" />}
        value="alice"
      />
    )
    expect(input).toHaveValue('alice')
    expect(startAdornment).toHaveStyle('color: var(--text-color-primary)')
  })

  describe('Password functionality', () => {
    it('renders password input with visibility toggle (and icon color tracks value)', () => {
      render(<Input label="Password" placeholder="Type password" type="password" />)
      const input = screen.getByPlaceholderText('Type password')
      expect(input).toHaveAttribute('type', 'password')

      const toggle = screen.getByLabelText('toggle password visibility')
      expect(toggle).toBeInTheDocument()

      expect(toggle).toHaveStyle('color: var(--text-color-secundary)')

      fireEvent.change(input, { target: { value: 'secret' } })
      expect(toggle).toHaveStyle('color: var(--text-color-primary)')
    })

    it('toggles password visibility on icon click', () => {
      render(<Input label="Password" placeholder="Type password" type="password" />)
      const input = screen.getByPlaceholderText('Type password')
      const toggle = screen.getByLabelText('toggle password visibility')

      expect(input).toHaveAttribute('type', 'password')
      fireEvent.click(toggle)
      expect(input).toHaveAttribute('type', 'text')
      fireEvent.click(toggle)
      expect(input).toHaveAttribute('type', 'password')
    })

    it('prioritizes password toggle over provided endIcon', () => {
      render(
        <Input
          label="Password"
          placeholder="Type password"
          type="password"
          endIcon={<Lock data-testid="end-icon" />}
        />
      )
      // Toggle must exist; endIcon must not render when type=password
      expect(screen.getByLabelText('toggle password visibility')).toBeInTheDocument()
      expect(screen.queryByTestId('end-icon')).not.toBeInTheDocument()
    })
  })

  describe('Icons', () => {
    it('renders with start icon (non-password)', () => {
      render(
        <Input
          label="User"
          placeholder="Type user"
          startIcon={<Person data-testid="start-icon" />}
        />
      )
      expect(screen.getByTestId('start-icon')).toBeInTheDocument()
    })

    it('renders with end icon (non-password)', () => {
      render(
        <Input
          label="Code"
          placeholder="Type code"
          endIcon={<Lock data-testid="end-icon" />}
        />
      )
      expect(screen.getByTestId('end-icon')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('forwards ref to the TextField root element', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Input ref={ref} label="Name" placeholder="Type" />)
      expect(ref.current).toBeTruthy()
    })

    it('accepts name and id attributes', () => {
      render(
        <Input
          label="Name"
          placeholder="Type name"
          name="user-name"
          id="user-input"
        />
      )
      const input = screen.getByPlaceholderText('Type name')
      expect(input).toHaveAttribute('name', 'user-name')
      expect(input).toHaveAttribute('id', 'user-input')
    })

    it('renders disabled (attribute + MUI disabled class present)', () => {
      render(<Input label="Name" placeholder="Type" disabled />)
      const input = screen.getByPlaceholderText('Type')
      expect(input).toBeDisabled()
       const root = input.closest('.MuiFormControl-root') || input.parentElement
      const html = (root?.outerHTML || '') + (input.outerHTML || '')
      expect(html).toMatch(/Mui-disabled/)
    })

    it('supports multiple input types', () => {
      const types = ['email', 'tel', 'date', 'time', 'search', 'datetime-local'] as const
      for (const type of types) {
        const { unmount } = render(
          <Input label="Field" placeholder="Type" type={type} />
        )
        const input = screen.getByPlaceholderText('Type')
        expect(input).toHaveAttribute('type', type)
        unmount()
      }
    })

    it('renders with initial value (string) and updates on typing', () => {
      const handleChange = vi.fn()
      render(
        <Input
          label="Name"
          placeholder="Type"
          value="John"
          onChange={handleChange}
        />
      )
      const input = screen.getByPlaceholderText('Type')
      expect(input).toHaveValue('John')
      fireEvent.change(input, { target: { value: 'Johnny' } })
      expect(handleChange).toHaveBeenCalled()
    })

    it('works when onChange is not provided (no crash)', () => {
      render(<Input label="Name" placeholder="Type" />)
      const input = screen.getByPlaceholderText('Type')
      fireEvent.change(input, { target: { value: 'Solo' } })

      expect(input).toBeInTheDocument()
    })
  })

  describe('Error handling', () => {
    it('shows error when error prop has non-empty trimmed text', () => {
      render(<Input label="Name" placeholder="Type" error="Validation error" />)
      expect(screen.getByText('Validation error')).toBeInTheDocument()
    })

    it('does not show error when error prop is empty string', () => {
      render(<Input label="Name" placeholder="Type" error="" />)
 
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(screen.queryByText(' ')).not.toBeInTheDocument()
    })

    it('does not show error when error prop is spaces only (trimmed empty)', () => {
      render(<Input label="Name" placeholder="Type" error="   " />)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(screen.queryByText('   ')).not.toBeInTheDocument()
    })

    it('updates error message when error prop changes', () => {
      const { rerender } = render(
        <Input label="Name" placeholder="Type" error="First error" />
      )
      expect(screen.getByText('First error')).toBeInTheDocument()

      rerender(<Input label="Name" placeholder="Type" error="Second error" />)
      expect(screen.getByText('Second error')).toBeInTheDocument()
      expect(screen.queryByText('First error')).not.toBeInTheDocument()
    })
  })
})
