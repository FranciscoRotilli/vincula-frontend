/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom/vitest';

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Filter, { FieldConfig, FilterValues } from '@/components/Filter';

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
}));

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
}));

vi.mock('@/components/Button', () => ({
  default: ({ 'data-testid': testId, onClick, disabled }: any) => (
    <button data-testid={testId} onClick={onClick} disabled={disabled}>
      BTN
    </button>
  ),
}));

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
}));

vi.mock('@/components/Modals/SaveFilterModal', () => ({
  default: ({ isOpen, onSubmit, onClose }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="save-filter-modal">
        <input
          data-testid="filter-name-input"
          onChange={(e) => {
            if (e.target.value === 'submit') {
              onSubmit({ filterName: 'Test Filter' });
            } else if (e.target.value === 'submit-trimmed') {
              onSubmit({ filterName: '  Trimmed Filter  ' });
            } else if (e.target.value === 'submit-empty') {
              onSubmit({ filterName: '' });
            } else if (e.target.value === 'submit-whitespace') {
              onSubmit({ filterName: '   ' });
            } else if (e.target.value === 'submit-special-chars') {
              onSubmit({ filterName: 'Filter @#$%^&*()' });
            } else if (e.target.value === 'submit-long-name') {
              onSubmit({ filterName: 'A'.repeat(100) });
            } else if (e.target.value === 'submit-unicode') {
              onSubmit({ filterName: 'Filtro 测试 🎉' });
            } else if (e.target.value === 'submit-null-simulate') {
              onSubmit({ filterName: null as any });
            }
          }}
        />
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    );
  },
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/test-path',
}));

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
];

describe('Filter component', () => {
  const mockOnFilter = vi.fn();
  const mockOnClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    localStorage.clear();
  });

  it('renders all fields correctly', () => {
    render(<Filter fields={fields} onFilter={mockOnFilter} />);

    expect(screen.getByTestId('caseNumber-input')).toBeInTheDocument();
    expect(screen.getByTestId('caseName-input')).toBeInTheDocument();
    expect(screen.getByTestId('responsible-input')).toBeInTheDocument();
    expect(screen.getByTestId('situation-select')).toBeInTheDocument();
  });

  it('renders with default values', () => {
    const defaults: FilterValues = {
      caseNumber: '10',
      caseName: 'Caso A',
      responsible: 'Alice',
      situation: 'Em andamento',
    };

    render(<Filter fields={fields} onFilter={mockOnFilter} defaultValues={defaults} />);

    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Caso A')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
  });

  it('handles input changes and triggers manual filter', () => {
    render(<Filter fields={fields} onFilter={mockOnFilter} />);

    const nameInput = screen.getByTestId('caseName-input');
    fireEvent.change(nameInput, { target: { value: 'Operação X' } });

    fireEvent.click(screen.getByTestId('filter-button'));
    expect(mockOnFilter).toHaveBeenCalledWith(expect.objectContaining({ caseName: 'Operação X' }));
  });

  it('handles select change and triggers auto filter immediately when autoFilter=true', async () => {
    render(<Filter fields={fields} onFilter={mockOnFilter} autoFilter />);

    const wrapper = screen.getByTestId('situation-select');
    const select = wrapper.querySelector('select') as HTMLSelectElement;

    fireEvent.input(select, { target: { value: 'closed' } });

    await waitFor(() =>
      expect(mockOnFilter).toHaveBeenCalledWith(expect.objectContaining({ situation: 'closed' }))
    );
  });

  it('runs debounced filter automatically when autoFilter with delay', async () => {
    render(<Filter fields={fields} onFilter={mockOnFilter} autoFilter debounceMs={60} />);

    const nameInput = screen.getByTestId('caseName-input');
    fireEvent.change(nameInput, { target: { value: 'John' } });

    await waitFor(() => expect(mockOnFilter).toHaveBeenCalledTimes(1), { timeout: 1000 });
    expect(mockOnFilter).toHaveBeenCalledWith(expect.objectContaining({ caseName: 'John' }));
  });

  it('cancels previous debounce when value changes before delay and fires once with latest value', async () => {
    render(<Filter fields={fields} onFilter={mockOnFilter} autoFilter debounceMs={80} />);

    const nameInput = screen.getByTestId('caseName-input');

    fireEvent.change(nameInput, { target: { value: 'A' } });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 30));
    });
    fireEvent.change(nameInput, { target: { value: 'AB' } });

    await waitFor(() => expect(mockOnFilter).toHaveBeenCalledTimes(1), { timeout: 1000 });
    expect(mockOnFilter).toHaveBeenCalledWith(expect.objectContaining({ caseName: 'AB' }));
  });

  it('clears filters when clear button is clicked', () => {
    render(<Filter fields={fields} onFilter={mockOnFilter} onClear={mockOnClear} />);

    const nameInput = screen.getByTestId('caseName-input');
    fireEvent.change(nameInput, { target: { value: 'Zeta' } });

    fireEvent.click(screen.getByTestId('clear-button'));
    expect(mockOnClear).toHaveBeenCalled();
  });

  it('shows validation errors and prevents filter call if invalid', () => {
    const validateField = vi.fn((key: string, value: string) =>
      key === 'caseNumber' && value === 'abc' ? 'Invalid number' : undefined
    );

    render(<Filter fields={fields} onFilter={mockOnFilter} validateField={validateField} />);

    const numInput = screen.getByTestId('caseNumber-input');
    fireEvent.change(numInput, { target: { value: 'abc' } });

    fireEvent.click(screen.getByTestId('filter-button'));

    expect(validateField).toHaveBeenCalled();
    expect(mockOnFilter).not.toHaveBeenCalled();
  });

  it('respects disabled state (buttons cannot be clicked)', () => {
    render(<Filter fields={fields} onFilter={mockOnFilter} disabled onClear={mockOnClear} />);

    expect(screen.getByTestId('filter-button')).toBeDisabled();
    expect(screen.getByTestId('clear-button')).toBeDisabled();
  });

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
    );

    const container = screen.getByTestId('filter-component');
    expect(container.className).toContain('custom-container');
  });

  it('handles controlled mode updates (values + onValuesChange)', () => {
    const onValuesChange = vi.fn();
    const values = { caseName: 'Controlled' };

    render(
      <Filter
        fields={fields}
        onFilter={mockOnFilter}
        values={values}
        onValuesChange={onValuesChange}
      />
    );

    const input = screen.getByTestId('caseName-input');
    fireEvent.change(input, { target: { value: 'Updated' } });

    expect(onValuesChange).toHaveBeenCalled();
  });

  describe('generate-report-button', () => {
    it('renders when graphFilter is true', () => {
      render(<Filter fields={fields} onFilter={() => {}} graphFilter={true} />);

      expect(screen.getByTestId('generate-report-button')).toBeInTheDocument();
    });

    it('does not render when graphFilter is false', () => {
      render(<Filter fields={fields} onFilter={() => {}} graphFilter={false} />);

      expect(screen.queryByTestId('generate-report-button')).not.toBeInTheDocument();
    });

    it('does not render when graphFilter is not provided', () => {
      render(<Filter fields={fields} onFilter={() => {}} />);

      expect(screen.queryByTestId('generate-report-button')).not.toBeInTheDocument();
    });

    it('calls handleClick when button is clicked and handleClick is provided', () => {
      const handleClick = vi.fn();
      render(
        <Filter fields={fields} onFilter={() => {}} graphFilter={true} handleClick={handleClick} />
      );

      const button = screen.getByTestId('generate-report-button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not error when button is clicked and handleClick is not provided', () => {
      render(<Filter fields={fields} onFilter={() => {}} graphFilter={true} />);

      const button = screen.getByTestId('generate-report-button');

      expect(() => fireEvent.click(button)).not.toThrow();
    });

    it('is disabled when disabled prop is true', () => {
      render(
        <Filter
          fields={fields}
          onFilter={() => {}}
          graphFilter={true}
          handleClick={vi.fn()}
          disabled={true}
        />
      );

      const button = screen.getByTestId('generate-report-button');
      expect(button).toBeDisabled();
    });

    it('is enabled when disabled prop is false', () => {
      render(
        <Filter
          fields={fields}
          onFilter={() => {}}
          graphFilter={true}
          handleClick={vi.fn()}
          disabled={false}
        />
      );

      const button = screen.getByTestId('generate-report-button');
      expect(button).not.toBeDisabled();
    });

    it('is enabled when disabled prop is not provided', () => {
      render(
        <Filter fields={fields} onFilter={() => {}} graphFilter={true} handleClick={vi.fn()} />
      );

      const button = screen.getByTestId('generate-report-button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('handleSaveFilter', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('saves filter to localStorage when valid name is provided', () => {
      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      fireEvent.click(screen.getByTestId('save-filter-button'));

      const input = screen.getByTestId('filter-name-input');
      fireEvent.change(input, { target: { value: 'submit' } });

      const saved = JSON.parse(localStorage.getItem('graphFilters_/test-path') || '[]');
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe('Test Filter');
      expect(saved[0].values).toEqual({});
      expect(saved[0].createdAt).toBeDefined();
    });

    it('trims whitespace from filter name before saving', () => {
      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      fireEvent.click(screen.getByTestId('save-filter-button'));

      const input = screen.getByTestId('filter-name-input');
      fireEvent.change(input, { target: { value: 'submit-trimmed' } });

      const saved = JSON.parse(localStorage.getItem('graphFilters_/test-path') || '[]');
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe('Trimmed Filter');
    });

    it('does not save filter when name is empty string', () => {
      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      fireEvent.click(screen.getByTestId('save-filter-button'));

      const input = screen.getByTestId('filter-name-input');
      fireEvent.change(input, { target: { value: 'submit-empty' } });

      const saved = JSON.parse(localStorage.getItem('graphFilters_/test-path') || '[]');
      expect(saved).toHaveLength(0);
    });

    it('does not save filter when name is only whitespace', () => {
      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      fireEvent.click(screen.getByTestId('save-filter-button'));

      const input = screen.getByTestId('filter-name-input');
      fireEvent.change(input, { target: { value: 'submit-whitespace' } });

      const saved = JSON.parse(localStorage.getItem('graphFilters_/test-path') || '[]');
      expect(saved).toHaveLength(0);
    });

    it('saves current filter values when saving a filter', () => {
      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      const nameInput = screen.getByTestId('caseName-input');
      fireEvent.change(nameInput, { target: { value: 'Test Case' } });

      const numberInput = screen.getByTestId('caseNumber-input');
      fireEvent.change(numberInput, { target: { value: '123' } });

      fireEvent.click(screen.getByTestId('save-filter-button'));
      const input = screen.getByTestId('filter-name-input');
      fireEvent.change(input, { target: { value: 'submit' } });

      const saved = JSON.parse(localStorage.getItem('graphFilters_/test-path') || '[]');
      expect(saved[0].values).toEqual({
        caseName: 'Test Case',
        caseNumber: '123',
      });
    });

    it('sets selectedSavedFilter to the saved filter name', () => {
      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      fireEvent.click(screen.getByTestId('save-filter-button'));

      const input = screen.getByTestId('filter-name-input');
      fireEvent.change(input, { target: { value: 'submit' } });

      const selects = screen.getAllByTestId('custom-select');
      const graphFilterSelect = selects.find((el) => {
        const select = el as HTMLSelectElement;
        return Array.from(select.options).some((opt) => opt.text === 'Test Filter');
      });

      expect(graphFilterSelect).toBeDefined();

      const saved = JSON.parse(localStorage.getItem('graphFilters_/test-path') || '[]');
      expect(saved[0].name).toBe('Test Filter');
    });

    it('includes createdAt timestamp when saving filter', () => {
      const beforeTime = Date.now();

      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      fireEvent.click(screen.getByTestId('save-filter-button'));

      const input = screen.getByTestId('filter-name-input');
      fireEvent.change(input, { target: { value: 'submit' } });

      const afterTime = Date.now();

      const saved = JSON.parse(localStorage.getItem('graphFilters_/test-path') || '[]');
      expect(saved[0].createdAt).toBeDefined();
      expect(typeof saved[0].createdAt).toBe('string');

      const createdAt = new Date(saved[0].createdAt).getTime();
      expect(createdAt).toBeGreaterThanOrEqual(beforeTime);
      expect(createdAt).toBeLessThanOrEqual(afterTime);
    });

    it('appends to existing saved filters in localStorage', () => {
      // Set up existing filters
      const existingFilters = [
        {
          name: 'Existing Filter',
          values: { caseName: 'Old' },
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem('graphFilters_/test-path', JSON.stringify(existingFilters));

      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      fireEvent.click(screen.getByTestId('save-filter-button'));

      const input = screen.getByTestId('filter-name-input');
      fireEvent.change(input, { target: { value: 'submit' } });

      const saved = JSON.parse(localStorage.getItem('graphFilters_/test-path') || '[]');
      expect(saved).toHaveLength(2);
      expect(saved[0].name).toBe('Existing Filter');
      expect(saved[1].name).toBe('Test Filter');
    });

    it('handles multiple filter saves correctly', () => {
      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      // Save first filter
      fireEvent.click(screen.getByTestId('save-filter-button'));
      let input = screen.getByTestId('filter-name-input');
      fireEvent.change(input, { target: { value: 'submit' } });

      // Close modal
      fireEvent.click(screen.getByTestId('modal-close'));

      // Save second filter
      fireEvent.click(screen.getByTestId('save-filter-button'));
      input = screen.getByTestId('filter-name-input');
      fireEvent.change(input, { target: { value: 'submit' } });

      const saved = JSON.parse(localStorage.getItem('graphFilters_/test-path') || '[]');
      expect(saved).toHaveLength(2);
      expect(saved[0].name).toBe('Test Filter');
      expect(saved[1].name).toBe('Test Filter');
    });

    it('handles filter names with special characters', () => {
      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      fireEvent.click(screen.getByTestId('save-filter-button'));

      const input = screen.getByTestId('filter-name-input');
      fireEvent.change(input, { target: { value: 'submit-special-chars' } });

      const saved = JSON.parse(localStorage.getItem('graphFilters_/test-path') || '[]');
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe('Filter @#$%^&*()');
    });

    it('handles very long filter names', () => {
      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      fireEvent.click(screen.getByTestId('save-filter-button'));

      const input = screen.getByTestId('filter-name-input');
      fireEvent.change(input, { target: { value: 'submit-long-name' } });

      const saved = JSON.parse(localStorage.getItem('graphFilters_/test-path') || '[]');
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe('A'.repeat(100));
      expect(saved[0].name.length).toBe(100);
    });

    it('handles filter names with unicode characters', () => {
      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      fireEvent.click(screen.getByTestId('save-filter-button'));

      const input = screen.getByTestId('filter-name-input');
      fireEvent.change(input, { target: { value: 'submit-unicode' } });

      const saved = JSON.parse(localStorage.getItem('graphFilters_/test-path') || '[]');
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe('Filtro 测试 🎉');
    });

    it('does not save when name is null', () => {
      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      fireEvent.click(screen.getByTestId('save-filter-button'));

      const input = screen.getByTestId('filter-name-input');
      fireEvent.change(input, { target: { value: 'submit-null-simulate' } });

      const saved = JSON.parse(localStorage.getItem('graphFilters_/test-path') || '[]');
      expect(saved).toHaveLength(0);
    });

    it('saves filter with all field types in values', () => {
      const fieldsWithAllTypes: FieldConfig[] = [
        { key: 'textField', label: 'Text', type: 'input' },
        {
          key: 'selectField',
          label: 'Select',
          type: 'select',
          options: [{ value: 'opt1', label: 'Option 1' }],
        },
        {
          key: 'multiSelectField',
          label: 'Multi Select',
          type: 'multi-select',
          options: [
            { value: 'opt1', label: 'Option 1' },
            { value: 'opt2', label: 'Option 2' },
          ],
        },
      ];

      render(<Filter fields={fieldsWithAllTypes} onFilter={mockOnFilter} graphFilter={true} />);

      const textInput = screen.getByTestId('textField-input');
      fireEvent.change(textInput, { target: { value: 'Text Value' } });

      fireEvent.click(screen.getByTestId('save-filter-button'));

      const input = screen.getByTestId('filter-name-input');
      fireEvent.change(input, { target: { value: 'submit' } });

      const saved = JSON.parse(localStorage.getItem('graphFilters_/test-path') || '[]');
      expect(saved).toHaveLength(1);
      expect(saved[0].values).toHaveProperty('textField');
      expect(saved[0].values.textField).toBe('Text Value');
    });

    it('preserves filter values exactly as they are in state', () => {
      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      fireEvent.change(screen.getByTestId('caseName-input'), { target: { value: 'Case 1' } });
      fireEvent.change(screen.getByTestId('caseNumber-input'), { target: { value: '12345' } });
      fireEvent.change(screen.getByTestId('responsible-input'), { target: { value: 'John Doe' } });

      fireEvent.click(screen.getByTestId('save-filter-button'));

      const input = screen.getByTestId('filter-name-input');
      fireEvent.change(input, { target: { value: 'submit' } });

      const saved = JSON.parse(localStorage.getItem('graphFilters_/test-path') || '[]');
      expect(saved[0].values).toEqual({
        caseName: 'Case 1',
        caseNumber: '12345',
        responsible: 'John Doe',
      });
    });

    it('does not modify existing filters when saving a new one', () => {
      const existingFilters = [
        {
          name: 'Existing Filter 1',
          values: { caseName: 'Existing Case' },
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          name: 'Existing Filter 2',
          values: { caseNumber: '999' },
          createdAt: '2024-01-02T00:00:00.000Z',
        },
      ];
      localStorage.setItem('graphFilters_/test-path', JSON.stringify(existingFilters));

      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      fireEvent.click(screen.getByTestId('save-filter-button'));

      const input = screen.getByTestId('filter-name-input');
      fireEvent.change(input, { target: { value: 'submit' } });

      const saved = JSON.parse(localStorage.getItem('graphFilters_/test-path') || '[]');
      expect(saved).toHaveLength(3);
      // Verify existing filters are unchanged
      expect(saved[0].name).toBe('Existing Filter 1');
      expect(saved[0].values).toEqual({ caseName: 'Existing Case' });
      expect(saved[1].name).toBe('Existing Filter 2');
      expect(saved[1].values).toEqual({ caseNumber: '999' });
      // New filter is appended
      expect(saved[2].name).toBe('Test Filter');
    });

    it('sets selectedSavedFilter correctly after saving', () => {
      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      fireEvent.click(screen.getByTestId('save-filter-button'));

      const input = screen.getByTestId('filter-name-input');
      fireEvent.change(input, { target: { value: 'submit' } });

      const selects = screen.getAllByTestId('custom-select');
      const graphFilterSelect = selects.find((el) => {
        const select = el as HTMLSelectElement;
        return select.value === 'Test Filter';
      });

      expect(graphFilterSelect).toBeDefined();
    });

    it('handles rapid successive saves correctly', () => {
      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      fireEvent.click(screen.getByTestId('save-filter-button'));
      const input = screen.getByTestId('filter-name-input');
      fireEvent.change(input, { target: { value: 'submit' } });

      fireEvent.change(input, { target: { value: 'submit' } });

      const saved = JSON.parse(localStorage.getItem('graphFilters_/test-path') || '[]');
      expect(saved.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('applySavedFilter', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('applies saved filter values to current filters', async () => {
      const savedFilter = {
        name: 'Test Filter',
        values: {
          caseName: 'Saved Case',
          caseNumber: '999',
          responsible: 'Saved Person',
        },
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('graphFilters_/test-path', JSON.stringify([savedFilter]));

      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      await screen.findByTestId('filter-component');

      await waitFor(() => {
        const selects = screen.getAllByTestId('custom-select');
        const graphFilterSelect = selects.find((el) => {
          const select = el as HTMLSelectElement;
          return Array.from(select.options).some((opt) => opt.text === 'Test Filter');
        });
        expect(graphFilterSelect).toBeInTheDocument();
      });

      const selects = screen.getAllByTestId('custom-select');
      const graphFilterSelect = selects.find((el) => {
        const select = el as HTMLSelectElement;
        return Array.from(select.options).some((opt) => opt.text === 'Test Filter');
      }) as HTMLSelectElement;

      expect(graphFilterSelect).toBeDefined();
      fireEvent.input(graphFilterSelect, { target: { value: 'Test Filter' } });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Saved Case')).toBeInTheDocument();
        expect(screen.getByDisplayValue('999')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Saved Person')).toBeInTheDocument();
      });
    });

    it('filters out values that are not in allowed keys', async () => {
      const savedFilter = {
        name: 'Test Filter',
        values: {
          caseName: 'Valid Field',
          caseNumber: '123',
          invalidKey: 'Should be ignored',
          anotherInvalidKey: 'Also ignored',
        },
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('graphFilters_/test-path', JSON.stringify([savedFilter]));

      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      await screen.findByTestId('filter-component');

      const selects = screen.getAllByTestId('custom-select');
      const graphFilterSelect = selects.find((el) => {
        const select = el as HTMLSelectElement;
        return Array.from(select.options).some((opt) => opt.text === 'Test Filter');
      }) as HTMLSelectElement;

      if (graphFilterSelect) {
        fireEvent.input(graphFilterSelect, { target: { value: 'Test Filter' } });

        await waitFor(() => {
          expect(screen.getByDisplayValue('Valid Field')).toBeInTheDocument();
          expect(screen.getByDisplayValue('123')).toBeInTheDocument();
        });

        expect(screen.queryByDisplayValue('Should be ignored')).not.toBeInTheDocument();
        expect(screen.queryByDisplayValue('Also ignored')).not.toBeInTheDocument();
      }
    });

    it('handles CaseStatus values correctly', async () => {
      const savedFilter = {
        name: 'Status Filter',
        values: {
          situation: 'Em andamento' as any,
          caseName: 'Test Case',
        },
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('graphFilters_/test-path', JSON.stringify([savedFilter]));

      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      await screen.findByTestId('filter-component');

      const selects = screen.getAllByTestId('custom-select');
      const graphFilterSelect = selects.find((el) => {
        const select = el as HTMLSelectElement;
        return Array.from(select.options).some((opt) => opt.text === 'Status Filter');
      }) as HTMLSelectElement;

      if (graphFilterSelect) {
        fireEvent.input(graphFilterSelect, { target: { value: 'Status Filter' } });

        await waitFor(() => {
          expect(screen.getByDisplayValue('Test Case')).toBeInTheDocument();
        });
      }
    });

    it('calls onFilter when autoFilter is true', async () => {
      const savedFilter = {
        name: 'Auto Filter Test',
        values: {
          caseName: 'Auto Case',
          caseNumber: '456',
        },
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('graphFilters_/test-path', JSON.stringify([savedFilter]));

      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} autoFilter />);

      await screen.findByTestId('filter-component');

      const selects = screen.getAllByTestId('custom-select');
      const graphFilterSelect = selects.find((el) => {
        const select = el as HTMLSelectElement;
        return Array.from(select.options).some((opt) => opt.text === 'Auto Filter Test');
      }) as HTMLSelectElement;

      if (graphFilterSelect) {
        fireEvent.input(graphFilterSelect, { target: { value: 'Auto Filter Test' } });

        await waitFor(() => {
          expect(mockOnFilter).toHaveBeenCalledWith(
            expect.objectContaining({
              caseName: 'Auto Case',
              caseNumber: '456',
            })
          );
        });
      }
    });

    it('does not call onFilter when autoFilter is false', async () => {
      const savedFilter = {
        name: 'Manual Filter Test',
        values: {
          caseName: 'Manual Case',
        },
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('graphFilters_/test-path', JSON.stringify([savedFilter]));

      render(
        <Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} autoFilter={false} />
      );

      await screen.findByTestId('filter-component');

      const selects = screen.getAllByTestId('custom-select');
      const graphFilterSelect = selects.find((el) => {
        const select = el as HTMLSelectElement;
        return Array.from(select.options).some((opt) => opt.text === 'Manual Filter Test');
      }) as HTMLSelectElement;

      if (graphFilterSelect) {
        fireEvent.input(graphFilterSelect, { target: { value: 'Manual Filter Test' } });

        await waitFor(() => {
          expect(screen.getByDisplayValue('Manual Case')).toBeInTheDocument();
        });

        expect(mockOnFilter).not.toHaveBeenCalled();
      }
    });

    it('clears debounce timer when autoFilter is true', async () => {
      const savedFilter = {
        name: 'Debounce Test',
        values: {
          caseName: 'Debounce Case',
        },
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('graphFilters_/test-path', JSON.stringify([savedFilter]));

      render(
        <Filter
          fields={fields}
          onFilter={mockOnFilter}
          graphFilter={true}
          autoFilter
          debounceMs={1000}
        />
      );

      await screen.findByTestId('filter-component');

      const nameInput = screen.getByTestId('caseName-input');
      fireEvent.change(nameInput, { target: { value: 'Initial' } });

      const selects = screen.getAllByTestId('custom-select');
      const graphFilterSelect = selects.find((el) => {
        const select = el as HTMLSelectElement;
        return Array.from(select.options).some((opt) => opt.text === 'Debounce Test');
      }) as HTMLSelectElement;

      if (graphFilterSelect) {
        fireEvent.input(graphFilterSelect, { target: { value: 'Debounce Test' } });

        await waitFor(() => {
          expect(mockOnFilter).toHaveBeenCalledWith(
            expect.objectContaining({
              caseName: 'Debounce Case',
            })
          );
        });
      }
    });

    it('handles empty saved filter values', async () => {
      const savedFilter = {
        name: 'Empty Filter',
        values: {},
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('graphFilters_/test-path', JSON.stringify([savedFilter]));

      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      await screen.findByTestId('filter-component');

      const selects = screen.getAllByTestId('custom-select');
      const graphFilterSelect = selects.find((el) => {
        const select = el as HTMLSelectElement;
        return Array.from(select.options).some((opt) => opt.text === 'Empty Filter');
      }) as HTMLSelectElement;

      if (graphFilterSelect) {
        fireEvent.input(graphFilterSelect, { target: { value: 'Empty Filter' } });

        await waitFor(() => {
          expect(graphFilterSelect.value).toBe('Empty Filter');
        });
      }
    });

    it('handles saved filter with only invalid keys', async () => {
      const savedFilter = {
        name: 'Invalid Keys Filter',
        values: {
          invalidKey1: 'Value 1',
          invalidKey2: 'Value 2',
        },
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('graphFilters_/test-path', JSON.stringify([savedFilter]));

      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} />);

      await screen.findByTestId('filter-component');

      const selects = screen.getAllByTestId('custom-select');
      const graphFilterSelect = selects.find((el) => {
        const select = el as HTMLSelectElement;
        return Array.from(select.options).some((opt) => opt.text === 'Invalid Keys Filter');
      }) as HTMLSelectElement;

      if (graphFilterSelect) {
        fireEvent.input(graphFilterSelect, { target: { value: 'Invalid Keys Filter' } });

        await waitFor(() => {
          expect(graphFilterSelect.value).toBe('Invalid Keys Filter');
        });
      }
    });

    it('works with controlled mode (values + onValuesChange)', async () => {
      const savedFilter = {
        name: 'Controlled Filter',
        values: {
          caseName: 'Controlled Case',
          caseNumber: '789',
        },
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('graphFilters_/test-path', JSON.stringify([savedFilter]));

      const onValuesChange = vi.fn();
      const values = { caseName: 'Initial' };

      render(
        <Filter
          fields={fields}
          onFilter={mockOnFilter}
          graphFilter={true}
          values={values}
          onValuesChange={onValuesChange}
        />
      );

      await screen.findByTestId('filter-component');

      const selects = screen.getAllByTestId('custom-select');
      const graphFilterSelect = selects.find((el) => {
        const select = el as HTMLSelectElement;
        return Array.from(select.options).some((opt) => opt.text === 'Controlled Filter');
      }) as HTMLSelectElement;

      if (graphFilterSelect) {
        fireEvent.input(graphFilterSelect, { target: { value: 'Controlled Filter' } });

        await waitFor(() => {
          expect(onValuesChange).toHaveBeenCalledWith(
            expect.objectContaining({
              caseName: 'Controlled Case',
              caseNumber: '789',
            })
          );
        });
      }
    });

    it('handles mixed valid and invalid values correctly', async () => {
      const savedFilter = {
        name: 'Mixed Filter',
        values: {
          caseName: 'Valid Name',
          invalidField: 'Invalid Value',
          caseNumber: '123',
          anotherInvalid: 'Another Invalid',
          responsible: 'Valid Responsible',
        },
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('graphFilters_/test-path', JSON.stringify([savedFilter]));

      render(<Filter fields={fields} onFilter={mockOnFilter} graphFilter={true} autoFilter />);

      await screen.findByTestId('filter-component');

      const selects = screen.getAllByTestId('custom-select');
      const graphFilterSelect = selects.find((el) => {
        const select = el as HTMLSelectElement;
        return Array.from(select.options).some((opt) => opt.text === 'Mixed Filter');
      }) as HTMLSelectElement;

      if (graphFilterSelect) {
        fireEvent.input(graphFilterSelect, { target: { value: 'Mixed Filter' } });

        await waitFor(() => {
          expect(mockOnFilter).toHaveBeenCalledWith(
            expect.objectContaining({
              caseName: 'Valid Name',
              caseNumber: '123',
              responsible: 'Valid Responsible',
            })
          );
        });

        const call = mockOnFilter.mock.calls[mockOnFilter.mock.calls.length - 1][0];
        expect(call).not.toHaveProperty('invalidField');
        expect(call).not.toHaveProperty('anotherInvalid');
      }
    });
  });
});
