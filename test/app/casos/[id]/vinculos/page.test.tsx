import { render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach,describe, expect, it, vi } from 'vitest'

import VinculosPage from '@/app/casos/[id]/vinculos/page'
import Providers from '@/app/providers'

vi.mock('@/components/CaseContainer', () => ({
  CaseContainer: ({ children, ...props }) => (
    <div data-testid="aba-container" {...props}>{children}</div>
  ),
}))

vi.mock('@/hooks/useCase', () => ({
  useCaseGraph: () => ({ data: null, isLoading: false, error: null }),
}))

vi.mock('@/components/Graph', () => ({
  __esModule: true,
  default: React.forwardRef<HTMLDivElement, any>(() => (
    <div data-testid="graph-mock" />
  )),
}))

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    use: (thenable: any) => {
      if (thenable && typeof thenable.then === 'function') {
        return { id: '123' }
      }
      return thenable
    },
  }
})

beforeEach(() => {
  vi.resetAllMocks()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ suspects: [] }),
  }))
})

describe('VinculosPage', () => {
  it('render page components correctly', async () => {
    const params = Promise.resolve({ id: 'qualquer-coisa' })

    render(
      <Providers>
        <VinculosPage params={params} />
      </Providers>
    )

    expect(await screen.findByTestId('graph-container')).toBeInTheDocument()
    expect(await screen.findByTestId('graph-controls')).toBeInTheDocument()
    expect(await screen.findByTestId('aba-container')).toBeInTheDocument()
    expect(await screen.findByTestId('graph-mock')).toBeInTheDocument()
  })
})
