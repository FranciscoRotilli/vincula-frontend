import '@testing-library/jest-dom/vitest'

import { CalendarMonth, Lock } from '@mui/icons-material'
import { fireEvent,render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import Input from '../../../src/components/input/Input'

describe('Input component', () => {
    it('renders with label and placeholder', () => {
        render(<Input label="Nome" placeholder="Digite seu nome" />)
        expect(screen.getByPlaceholderText('Digite seu nome')).toBeInTheDocument()
        expect(screen.getByText('Nome')).toBeInTheDocument()
    })

    it('calls onChange when typing', () => {
        const handleChange = vi.fn()
        render(<Input label="Nome" placeholder="Digite seu nome" onChange={handleChange} />)
        const input = screen.getByPlaceholderText('Digite seu nome')
        fireEvent.change(input, { target: { value: 'João' } })
        expect(handleChange).toHaveBeenCalled()
    })

    it('shows error from prop', () => {
        render(<Input label="Nome" placeholder="Digite seu nome" error="Erro de validação" />)
        expect(screen.getByText('Erro de validação')).toBeInTheDocument()
    })

    it('does not show error when error prop is not provided', () => {
        render(<Input label="Nome" placeholder="Digite seu nome" />)
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    describe('Password functionality', () => {
        it('renders password input with visibility toggle', () => {
            render(<Input label="Senha" placeholder="Digite sua senha" type="password" />)
            const input = screen.getByPlaceholderText('Digite sua senha')
            expect(input).toHaveAttribute('type', 'password')
            expect(screen.getByLabelText('toggle password visibility')).toBeInTheDocument()
        })

        it('toggles password visibility when clicking the eye icon', () => {
            render(<Input label="Senha" placeholder="Digite sua senha" type="password" />)
            const input = screen.getByPlaceholderText('Digite sua senha')
            const toggleButton = screen.getByLabelText('toggle password visibility')
            
            expect(input).toHaveAttribute('type', 'password')
            fireEvent.click(toggleButton)
            expect(input).toHaveAttribute('type', 'text')
            fireEvent.click(toggleButton)
            expect(input).toHaveAttribute('type', 'password')
        })
    })

    describe('Variants', () => {
        it('renders with filled variant', () => {
            render(<Input label="Nome" placeholder="Digite seu nome" variant="filled" />)
            expect(screen.getByText('Nome')).toBeInTheDocument()
        })

        it('renders with standard variant', () => {
            render(<Input label="Nome" placeholder="Digite seu nome" variant="standard" />)
            expect(screen.getByText('Nome')).toBeInTheDocument()
        })

        it('renders with outlined variant (default)', () => {
            render(<Input label="Nome" placeholder="Digite seu nome" />)
            expect(screen.getByText('Nome')).toBeInTheDocument()
        })
    })

    describe('Icons', () => {
        it('renders with start icon', () => {
            render(<Input label="Data" placeholder="Selecione a data" startIcon={<CalendarMonth data-testid="start-icon" />} />)
            expect(screen.getByTestId('start-icon')).toBeInTheDocument()
        })

        it('renders with end icon (not password)', () => {
            render(<Input label="Código" placeholder="Digite o código" endIcon={<Lock data-testid="end-icon" />} />)
            expect(screen.getByTestId('end-icon')).toBeInTheDocument()
        })

        it('prioritizes password visibility icon over endIcon', () => {
            render(<Input label="Senha" placeholder="Digite sua senha" type="password" endIcon={<Lock data-testid="end-icon" />} />)
            expect(screen.getByLabelText('toggle password visibility')).toBeInTheDocument()
            expect(screen.queryByTestId('end-icon')).not.toBeInTheDocument()
        })
    })

    describe('Props', () => {
        it('renders disabled input', () => {
            render(<Input label="Nome" placeholder="Digite seu nome" disabled />)
            const input = screen.getByPlaceholderText('Digite seu nome')
            expect(input).toBeDisabled()
        })

        it('renders with custom height', () => {
            render(<Input label="Nome" placeholder="Digite seu nome" height={60} />)
            const input = screen.getByPlaceholderText('Digite seu nome')
            expect(input.parentElement).toHaveStyle('height: 60px')
        })

        it('renders with different input types', () => {
            const types = ['email', 'tel', 'date', 'time', 'search'] as const
            types.forEach(type => {
                const { unmount } = render(<Input label="Campo" placeholder="Digite" type={type} />)
                const input = screen.getByPlaceholderText('Digite')
                expect(input).toHaveAttribute('type', type)
                unmount()
            })
        })

        it('renders with name and id attributes', () => {
            render(<Input label="Nome" placeholder="Digite seu nome" name="user-name" id="user-input" />)
            const input = screen.getByPlaceholderText('Digite seu nome')
            expect(input).toHaveAttribute('name', 'user-name')
            expect(input).toHaveAttribute('id', 'user-input')
        })

        it('renders with initial value prop', () => {
            render(<Input label="Nome" placeholder="Digite seu nome" value="João Silva" />)
            const input = screen.getByPlaceholderText('Digite seu nome')
            expect(input).toHaveValue('João Silva')
        })

        it('handles numeric value prop converted to string', () => {
            render(<Input label="Idade" placeholder="Digite sua idade" value="25" />)
            const input = screen.getByPlaceholderText('Digite sua idade')
            expect(input).toHaveValue('25')
        })
    })

    describe('Required field', () => {
        it('shows asterisk in label when required', () => {
            render(<Input label="Nome" placeholder="Digite seu nome" required />)
            expect(screen.getByText('Nome *')).toBeInTheDocument()
        })

        it('does not show asterisk when not required', () => {
            render(<Input label="Nome" placeholder="Digite seu nome" />)
            expect(screen.getByText('Nome')).toBeInTheDocument()
            expect(screen.queryByText('Nome *')).not.toBeInTheDocument()
        })
    })

    describe('Error handling', () => {
        it('shows error when error prop is provided', () => {
            render(<Input label="Nome" placeholder="Digite seu nome" error="Erro externo" />)
            expect(screen.getByText('Erro externo')).toBeInTheDocument()
        })

        it('hides error when error prop is empty or undefined', () => {
            const { rerender } = render(<Input label="Nome" placeholder="Digite seu nome" error="" />)
            expect(screen.queryByRole('alert')).not.toBeInTheDocument()
            
            rerender(<Input label="Nome" placeholder="Digite seu nome" error={undefined} />)
            expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        })

        it('updates error message when error prop changes', () => {
            const { rerender } = render(<Input label="Nome" placeholder="Digite seu nome" error="Primeiro erro" />)
            expect(screen.getByText('Primeiro erro')).toBeInTheDocument()
            
            rerender(<Input label="Nome" placeholder="Digite seu nome" error="Segundo erro" />)
            expect(screen.getByText('Segundo erro')).toBeInTheDocument()
            expect(screen.queryByText('Primeiro erro')).not.toBeInTheDocument()
        })
    })

    describe('Icon color changes', () => {
        it('changes icon color when user types in input', () => {
            render(<Input label="Email" placeholder="Digite seu email" startIcon={<CalendarMonth data-testid="start-icon" />} />)
            
            const input = screen.getByPlaceholderText('Digite seu email')
            const startIcon = screen.getByTestId('start-icon').parentElement
            
            expect(startIcon).toHaveStyle('color: var(--text-color-secundary)')
            
            fireEvent.change(input, { target: { value: 'test@example.com' } })
            
            expect(startIcon).toHaveStyle('color: var(--text-color-primary)')
            
            fireEvent.change(input, { target: { value: '' } })
            
            expect(startIcon).toHaveStyle('color: var(--text-color-secundary)')
        })

        it('changes icon color when component receives value prop', () => {
            const { rerender } = render(<Input label="Email" placeholder="Digite seu email" startIcon={<CalendarMonth data-testid="start-icon" />} />)
            
            const startIcon = screen.getByTestId('start-icon').parentElement
            
            expect(startIcon).toHaveStyle('color: var(--text-color-secundary)')
            
            rerender(<Input label="Email" placeholder="Digite seu email" startIcon={<CalendarMonth data-testid="start-icon" />} value="test@example.com" />)
            
            expect(startIcon).toHaveStyle('color: var(--text-color-primary)')
            
            rerender(<Input label="Email" placeholder="Digite seu email" startIcon={<CalendarMonth data-testid="start-icon" />} value="" />)
            
            expect(startIcon).toHaveStyle('color: var(--text-color-secundary)')
        })

        it('changes password toggle icon color when user types', () => {
            render(<Input label="Senha" placeholder="Digite sua senha" type="password" />)
            
            const input = screen.getByPlaceholderText('Digite sua senha')
            const toggleButton = screen.getByLabelText('toggle password visibility')
            
            expect(toggleButton).toHaveStyle('color: var(--text-color-secundary)')
            
            fireEvent.change(input, { target: { value: 'mypassword' } })
            
            expect(toggleButton).toHaveStyle('color: var(--text-color-primary)')
        })

        it('changes end icon color when user types', () => {
            render(<Input label="Código" placeholder="Digite o código" endIcon={<Lock data-testid="end-icon" />} />)
            
            const input = screen.getByPlaceholderText('Digite o código')
            const endIcon = screen.getByTestId('end-icon').parentElement
            
            expect(endIcon).toHaveStyle('color: var(--text-color-secundary)')
            
            fireEvent.change(input, { target: { value: '123456' } })
            
            expect(endIcon).toHaveStyle('color: var(--text-color-primary)')
        })
    })
})