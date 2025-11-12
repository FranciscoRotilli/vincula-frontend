import '@testing-library/jest-dom/vitest'

import { act,fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Filter, { FieldConfig, FilterValues } from '@/components/Filter'

vi.mock('@/components/Filter/Filter.module.css', () => ({
  default: {
    filterContainer: 'filterContainer',
    fieldsRow: 'fieldsRow',
    inputWrapper: 'inputWrapper',
    actions: 'actions',
    iconButton: 'iconButton',
    saveFilter: 'saveFilter',
    label: 'label',
  },
}))

vi.mock('@/components/Input', () => ({
  default: ({ label, placeholder, onChange, value, 'data-testid': testId }: any) => (
    <input
      aria-label={label}
      placeholder={placeholder}
      value={value}
      data-testid={testId}
      onChange={(e) => onChange(e)}
    />
  ),
}))

vi.mock('@/components/Button', () => ({
  default: ({ 'data-testid': testId, onClick, disabled }: any) => (
    <button data-testid={testId} onClick={onClick} disabled={disabled}>
      BTN
    </button>
  ),
}))

vi.mock('@/components/Select', () => ({
  CustomSelect: ({ onChange, options, value, 'data-testid': testId }: any) => (
    <select
      data-testid={testId || 'custom-select'}
      value={value}
      onInput={(e) => onChange?.((e.target as HTMLSelectElement).value)}
    >
      <option value="">Selecione</option>
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}))

const fields: FieldConfig[] = [
  { key: 'caseNumber', label: 'Número do Caso', type: 'input', placeholder: 'Digite o número' },
  { key: 'caseName', label: 'Nome do Caso', type: 'input', placeholder: 'Digite o nome' },
  { key: 'responsible', label: 'Responsável', type: 'input', placeholder: 'Digite o responsável' },
  {
    key: 'situation',
    label: 'Situação',
    type: 'select',
    options: [
      { value: 'open', label: 'Aberto' },
      { value: 'closed', label: 'Fechado' },
    ],
  },
]

describe('Filter component', () => {
  const mockOnFilter = vi.fn()
  const mockOnClear = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('renders all fields correctly', () => {
    render(<Filter fields={fields} onFilter={mockOnFilter} />)

    expect(screen.getByTestId('caseNumber-input')).toBeInTheDocument()
    expect(screen.getByTestId('caseName-input')).toBeInTheDocument()
    expect(screen.getByTestId('responsible-input')).toBeInTheDocument()
    expect(screen.getByTestId('situation-select')).toBeInTheDocument()
  })

  it('renders with default values', () => {
    const defaults: FilterValues = {
      caseNumber: '10',
      caseName: 'Caso A',
      responsible: 'Alice',
      situation: 'Aberto',
    }

    render(<Filter fields={fields} onFilter={mockOnFilter} defaultValues={defaults} />)

    expect(screen.getByDisplayValue('10')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Caso A')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument()
  })

  it('handles input changes and triggers manual filter', () => {
    render(<Filter fields={fields} onFilter={mockOnFilter} />)

    const nameInput = screen.getByTestId('caseName-input')
    fireEvent.change(nameInput, { target: { value: 'Operação X' } })

    fireEvent.click(screen.getByTestId('filter-button'))
    expect(mockOnFilter).toHaveBeenCalledWith(
      expect.objectContaining({ caseName: 'Operação X' })
    )
  })

  it('handles select change and triggers auto filter immediately when autoFilter=true', async () => {
    render(<Filter fields={fields} onFilter={mockOnFilter} autoFilter />)

    const wrapper = screen.getByTestId('situation-select')
    const select = wrapper.querySelector('select') as HTMLSelectElement

    fireEvent.input(select, { target: { value: 'closed' } })

    await waitFor(() =>
      expect(mockOnFilter).toHaveBeenCalledWith(
        expect.objectContaining({ situation: 'closed' })
      )
    )
  })

  it('runs debounced filter automatically when autoFilter with delay', async () => {
    render(<Filter fields={fields} onFilter={mockOnFilter} autoFilter debounceMs={60} />)

    const nameInput = screen.getByTestId('caseName-input')
    fireEvent.change(nameInput, { target: { value: 'John' } })

    await waitFor(() => expect(mockOnFilter).toHaveBeenCalledTimes(1), { timeout: 1000 })
    expect(mockOnFilter).toHaveBeenCalledWith(expect.objectContaining({ caseName: 'John' }))
  })

  it('cancels previous debounce when value changes before delay and fires once with latest value', async () => {
    render(<Filter fields={fields} onFilter={mockOnFilter} autoFilter debounceMs={80} />)

    const nameInput = screen.getByTestId('caseName-input')

    fireEvent.change(nameInput, { target: { value: 'A' } })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 30))
    })
    fireEvent.change(nameInput, { target: { value: 'AB' } })

    await waitFor(() => expect(mockOnFilter).toHaveBeenCalledTimes(1), { timeout: 1000 })
    expect(mockOnFilter).toHaveBeenCalledWith(expect.objectContaining({ caseName: 'AB' }))
  })

  it('clears filters when clear button is clicked', () => {
    render(<Filter fields={fields} onFilter={mockOnFilter} onClear={mockOnClear} />)

    const nameInput = screen.getByTestId('caseName-input')
    fireEvent.change(nameInput, { target: { value: 'Zeta' } })

    fireEvent.click(screen.getByTestId('clear-button'))
    expect(mockOnClear).toHaveBeenCalled()
  })

  it('shows validation errors and prevents filter call if invalid', () => {
    const validateField = vi.fn((key: string, value: string) =>
      key === 'caseNumber' && value === 'abc' ? 'Invalid number' : undefined
    )

    render(<Filter fields={fields} onFilter={mockOnFilter} validateField={validateField} />)

    const numInput = screen.getByTestId('caseNumber-input')
    fireEvent.change(numInput, { target: { value: 'abc' } })

    fireEvent.click(screen.getByTestId('filter-button'))

    expect(validateField).toHaveBeenCalled()
    expect(mockOnFilter).not.toHaveBeenCalled()
  })

  it('respects disabled state (buttons cannot be clicked)', () => {
    render(<Filter fields={fields} onFilter={mockOnFilter} disabled onClear={mockOnClear} />)

    expect(screen.getByTestId('filter-button')).toBeDisabled()
    expect(screen.getByTestId('clear-button')).toBeDisabled()
  })

  it('applies custom styles when provided', () => {
    render(
      <Filter
        fields={fields}
        onFilter={mockOnFilter}
        customStyles={{
          container: 'custom-container',
          fieldsRow: 'custom-row',
          inputWrapper: 'custom-input',
          actions: 'custom-actions',
        }}
      />
    )

    const container = screen.getByTestId('filter-component')
    expect(container.className).toContain('custom-container')
  })

  it('handles controlled mode updates (values + onValuesChange)', () => {
    const onValuesChange = vi.fn()
    const values = { caseName: 'Controlled' }

    render(
      <Filter
        fields={fields}
        onFilter={mockOnFilter}
        values={values}
        onValuesChange={onValuesChange}
      />
    )

    const input = screen.getByTestId('caseName-input')
    fireEvent.change(input, { target: { value: 'Updated' } })

    expect(onValuesChange).toHaveBeenCalled()
  })
})
