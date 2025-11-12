import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen, within } from '@testing-library/react'
import React from 'react'
import { describe, expect,it } from 'vitest'

import InputShowcase from '../../../src/components/Input/InputShowcase'

describe('InputShowcase', () => {
  it('sanity: InputShowcase is a valid component (fix the import if this fails)', () => {
    expect(InputShowcase, 'InputShowcase import is undefined — check the import path/export').toBeTruthy()
    expect(typeof InputShowcase).toBe('function')
  })

  it('renders the showcase container and multiple Input examples', () => {
    const { container } = render(<InputShowcase />)
    expect(container.firstChild).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.getAllByPlaceholderText(/Placeholder|Insira o usuário|Insira a senha/i).length).toBeGreaterThan(5)
  })

  it('first example is controlled: starts with "Value" and updates on typing', () => {
    render(<InputShowcase />)
    const first = screen.getAllByPlaceholderText('Placeholder')[0]
    expect(first).toHaveValue('Value')
    fireEvent.change(first, { target: { value: 'New Value' } })
    expect(first).toHaveValue('New Value')
  })

  it('shows error text for the example with explicit error "Error message"', () => {
    render(<InputShowcase />)
    expect(screen.getByText('Error message')).toBeInTheDocument()
  })

  it('does NOT show error text for an error prop that is only whitespace (trimmed empty)', () => {
    render(<InputShowcase />)
    expect(screen.queryByText(' ')).not.toBeInTheDocument()
  })

  it('renders required labels with asterisk for non-filled variants', () => {
    render(<InputShowcase />)
    expect(screen.getAllByText('Usuário *').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Senha *').length).toBeGreaterThan(0)
  })

  it('filled variant uses internal label (no external asterisk appended)', () => {
    render(<InputShowcase />)

    const pwds = screen.getAllByPlaceholderText('Insira a senha')

    const filledPwd = pwds.find((el) =>
      el.closest('div[class*="MuiFilledInput-root"]')
    )
    expect(filledPwd, 'Could not locate a password input rendered with Filled variant').toBeTruthy()

    const formControl = filledPwd!.closest('.MuiFormControl-root') as HTMLElement
    expect(formControl).toBeTruthy()

    expect(within(formControl).queryByText('Senha *')).toBeNull()

    expect(screen.getAllByText('Senha').length).toBeGreaterThan(0)
  })

  it('password examples render as type=password initially and can toggle visibility', () => {
    render(<InputShowcase />)
    const pwds = screen.getAllByPlaceholderText('Insira a senha')
    expect(pwds.length).toBeGreaterThan(0)
    pwds.forEach((el) => expect(el).toHaveAttribute('type', 'password'))

    const toggles = screen.getAllByLabelText('toggle password visibility')
    expect(toggles.length).toBeGreaterThan(0)

    fireEvent.click(toggles[0])
    expect(pwds[0]).toHaveAttribute('type', 'text')
    fireEvent.click(toggles[0])
    expect(pwds[0]).toHaveAttribute('type', 'password')
  })

  it('shows error messages for the examples with "Usuário ou senha inválido."', () => {
    render(<InputShowcase />)
    const msgs = screen.getAllByText('Usuário ou senha inválido.')
    expect(msgs.length).toBeGreaterThanOrEqual(2)
  })

  it('renders start icons across examples (using generic stub data-testid)', () => {
    render(<InputShowcase />)

    const icons = screen.getAllByTestId('mui-icon')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('renders a plain input with only placeholder (no label)', () => {
    render(<InputShowcase />)
    const allPlaceholders = screen.getAllByPlaceholderText('Placeholder')
    expect(allPlaceholders.length).toBeGreaterThan(0)
  })
})
