import { fireEvent,render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

vi.mock('@/texts', () => ({
  t: (key: string) => key,
}))

vi.mock('@/components/Button', () => ({
  default: ({ label, onClick }: { label: string; onClick?: () => void }) => (
    <button data-testid="mock-button" onClick={onClick}>
      {label}
    </button>
  ),
}))

import { GraphAlerts } from '@/components/GraphAlerts'

function baseProps(overrides: Partial<React.ComponentProps<typeof GraphAlerts>> = {}) {
  return {
    isLoading: false,
    hasError: false,
    errorMessage: undefined,
    hasActiveFilters: false,
    hasNodes: false,
    caseId: 'CASE-123',
    ...overrides,
  }
}

describe('GraphAlerts', () => {
  beforeEach(() => {
    pushMock.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state with spinner and loading text', () => {
    render(<GraphAlerts {...baseProps({ isLoading: true })} />)

    expect(screen.getByTestId('graph-alert-cointainer')).toBeInTheDocument()
    expect(screen.getByTestId('graph-alert-loading')).toBeInTheDocument()

    expect(screen.getByText('graph.loading')).toBeInTheDocument()
  })

  it('renders error state with provided error message', () => {
    render(<GraphAlerts {...baseProps({ hasError: true, errorMessage: 'Boom!' })} />)

    expect(screen.getByTestId('graph-alert-cointainer-error')).toBeInTheDocument()
    expect(screen.getByTestId('graph-alert-error')).toBeInTheDocument()

    expect(screen.getByText('graph.errorTitle')).toBeInTheDocument()
    expect(screen.getByText('Boom!')).toBeInTheDocument()
  })

  it('renders error state with fallback message when errorMessage is not provided', () => {
    render(<GraphAlerts {...baseProps({ hasError: true })} />)

    expect(screen.getByTestId('graph-alert-cointainer-error')).toBeInTheDocument()
    expect(screen.getByText('graph.errorTitle')).toBeInTheDocument()
    expect(screen.getByText('graph.errorUnknown')).toBeInTheDocument()
  })

  it('renders warning when there are active filters and no nodes', () => {
    render(<GraphAlerts {...baseProps({ hasActiveFilters: true, hasNodes: false })} />)

    expect(screen.getByTestId('graph-alert-cointainer')).toBeInTheDocument()
    const warning = screen.getByTestId('graph-alert-warning')
    expect(warning).toBeInTheDocument()

    expect(screen.getByText('graph.noResults')).toBeInTheDocument()
    expect(screen.getByText('graph.noResultsDescription')).toBeInTheDocument()
    expect(screen.getByText('graph.noResultsHint')).toBeInTheDocument()
  })

  it('renders empty state when there are no filters and no nodes, and navigates on button click', () => {
    const caseId = 'CASE-XYZ'
    render(<GraphAlerts {...baseProps({ hasActiveFilters: false, hasNodes: false, caseId })} />)

    expect(screen.getByTestId('graph-alert-cointainer')).toBeInTheDocument()
    expect(screen.getByTestId('graph-alert-empty')).toBeInTheDocument()

    expect(screen.getByText('graph.noData')).toBeInTheDocument()
    expect(screen.getByText('graph.noDataDescription')).toBeInTheDocument()

    const btnContainer = screen.getByTestId('graph-alert-button')
    expect(btnContainer).toBeInTheDocument()
    const btn = screen.getByTestId('mock-button')
    expect(btn).toHaveTextContent('graph.goToGeneralInfo')

    fireEvent.click(btn)
    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith(`/casos/${caseId}`)
  })

  it('returns null (renders nothing) when there are nodes and no loading/error', () => {
    const { container } = render(<GraphAlerts {...baseProps({ hasNodes: true })} />)

    expect(container.firstChild).toBeNull()
  })
})
