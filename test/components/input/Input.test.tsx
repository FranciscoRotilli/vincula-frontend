import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CalendarMonth, Lock } from '@mui/icons-material'
import Input from '../../../src/components/input/Input'

describe('Input component', () => {
    it('renders with label and placeholder', () => {
        render(<Input label="Nome" placeholder="Digite seu nome" />)
        expect(screen.getByPlaceholderText('Digite seu nome')).toBeInTheDocument()
        expect(screen.getByText('Nome')).toBeInTheDocument()
    })

    it('calls onChange when typing', () => {
        const handleChange = jest.fn()
        render(<Input label="Nome" placeholder="Digite seu nome" onChange={handleChange} />)
        const input = screen.getByPlaceholderText('Digite seu nome')
        fireEvent.change(input, { target: { value: 'João' } })
        expect(handleChange).toHaveBeenCalled()
    })

    it('shows error from prop', () => {
        render(<Input label="Nome" placeholder="Digite seu nome" error="Erro de validação" />)
        expect(screen.getByText('Erro de validação')).toBeInTheDocument()
    })

    it('shows custom validation error on blur', () => {
        const validate = (value: string) => value !== 'ok' ? 'Valor inválido' : undefined
        render(<Input label="Teste" placeholder="Teste" validate={validate} />)
        const input = screen.getByPlaceholderText('Teste')
        fireEvent.change(input, { target: { value: 'errado' } })
        fireEvent.blur(input)
        expect(screen.getByText('Valor inválido')).toBeInTheDocument()
    })

    it('shows required error on blur', () => {
        render(<Input label="Nome" placeholder="Digite seu nome" required />)
        const input = screen.getByPlaceholderText('Digite seu nome') as HTMLInputElement
        
        Object.defineProperty(input, 'validity', {
            value: { valueMissing: true, valid: false },
            writable: true
        })
        fireEvent.blur(input)
        expect(screen.getByText('Campo obrigatório')).toBeInTheDocument()
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
            // With filled variant, the label should be inside the TextField (MUI behavior)
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

    describe('Validation constraints', () => {
        it('shows minLength error', () => {
            render(<Input label="Senha" placeholder="Digite sua senha" minLength={8} />)
            const input = screen.getByPlaceholderText('Digite sua senha') as HTMLInputElement
            
            // Simulate HTML5 validation
            fireEvent.change(input, { target: { value: '123' } })
            Object.defineProperty(input, 'validity', {
                value: { tooShort: true, valid: false },
                writable: true
            })
            Object.defineProperty(input, 'minLength', {
                value: 8,
                writable: true
            })
            fireEvent.blur(input)
            expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument()
        })

        it('shows maxLength error', () => {
            render(<Input label="Nome" placeholder="Digite seu nome" maxLength={5} />)
            const input = screen.getByPlaceholderText('Digite seu nome') as HTMLInputElement
            
            // Simulate HTML5 validation
            fireEvent.change(input, { target: { value: '123456789' } })
            Object.defineProperty(input, 'validity', {
                value: { tooLong: true, valid: false },
                writable: true
            })
            Object.defineProperty(input, 'maxLength', {
                value: 5,
                writable: true
            })
            fireEvent.blur(input)
            expect(screen.getByText('Máximo 5 caracteres')).toBeInTheDocument()
        })

        it('shows pattern mismatch error', () => {
            render(<Input label="Código" placeholder="Digite o código" pattern="[0-9]{4}" />)
            const input = screen.getByPlaceholderText('Digite o código') as HTMLInputElement
            
            fireEvent.change(input, { target: { value: 'abc' } })
            Object.defineProperty(input, 'validity', {
                value: { patternMismatch: true, valid: false },
                writable: true
            })
            fireEvent.blur(input)
            expect(screen.getByText('Valor inválido')).toBeInTheDocument()
        })

        it('shows type mismatch error for email', () => {
            render(<Input label="Email" placeholder="Digite seu email" type="email" />)
            const input = screen.getByPlaceholderText('Digite seu email') as HTMLInputElement
            
            fireEvent.change(input, { target: { value: 'email-invalido' } })
            Object.defineProperty(input, 'validity', {
                value: { typeMismatch: true, valid: false },
                writable: true
            })
            fireEvent.blur(input)
            expect(screen.getByText('Formato inválido')).toBeInTheDocument()
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

        it('renders with value prop', () => {
            render(<Input label="Nome" placeholder="Digite seu nome" value="João Silva" />)
            const input = screen.getByPlaceholderText('Digite seu nome')
            expect(input).toHaveValue('João Silva')
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
        it('clears error when input becomes valid', () => {
            const validate = (value: string) => value.length < 3 ? 'Mínimo 3 caracteres' : undefined
            render(<Input label="Nome" placeholder="Digite seu nome" validate={validate} />)
            const input = screen.getByPlaceholderText('Digite seu nome')
            
            // Trigger error
            fireEvent.change(input, { target: { value: 'ab' } })
            fireEvent.blur(input)
            expect(screen.getByText('Mínimo 3 caracteres')).toBeInTheDocument()
            
            // Fix error
            fireEvent.change(input, { target: { value: 'abc' } })
            fireEvent.blur(input)
            expect(screen.queryByText('Mínimo 3 caracteres')).not.toBeInTheDocument()
        })

        it('prioritizes custom validation error over built-in validation', () => {
            const validate = (value: string) => 'Erro customizado'
            render(<Input label="Nome" placeholder="Digite seu nome" validate={validate} required />)
            const input = screen.getByPlaceholderText('Digite seu nome')
            
            fireEvent.change(input, { target: { value: 'teste' } })
            fireEvent.blur(input)
            expect(screen.getByText('Erro customizado')).toBeInTheDocument()
            expect(screen.queryByText('Campo obrigatório')).not.toBeInTheDocument()
        })

        it('shows prop error even when input is valid', () => {
            render(<Input label="Nome" placeholder="Digite seu nome" error="Erro externo" value="Valor válido" />)
            expect(screen.getByText('Erro externo')).toBeInTheDocument()
        })
    })
})