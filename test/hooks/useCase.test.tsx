import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  useAllowVisualization,
  useCase,
  useCaseById,
  useCaseGraph,
  useCases,
  useDeleteCase,
  useUpdateCaseCanView,
  useUpdateCaseName,
  useUpdateCaseSituation,
} from '@/hooks/useCase'

const addCaseMock = vi.fn()
const getCasesMock = vi.fn()
const updateCaseNameMock = vi.fn()
const updateCaseSituationMock = vi.fn()
const updateCaseCanViewMock = vi.fn()
const deleteCaseMock = vi.fn()
const getCaseByIdMock = vi.fn()
const allowUserToViewCaseMock = vi.fn()
const getCaseGraphMock = vi.fn()

vi.mock('@/services/caseService', () => ({
  addCase: (...args: any[]) => addCaseMock(...args),
  getCases: (...args: any[]) => getCasesMock(...args),
  updateCaseName: (...args: any[]) => updateCaseNameMock(...args),
  updateCaseSituation: (...args: any[]) => updateCaseSituationMock(...args),
  updateCaseCanView: (...args: any[]) => updateCaseCanViewMock(...args),
  deleteCase: (...args: any[]) => deleteCaseMock(...args),
  getCaseById: (...args: any[]) => getCaseByIdMock(...args),
  allowUserToViewCase: (...args: any[]) => allowUserToViewCaseMock(...args),
  getCaseGraph: (...args: any[]) => getCaseGraphMock(...args),
}))

const createClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

const makeWrapper = (client: QueryClient) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  localStorage.setItem('access_token', 'mock-token')

  addCaseMock.mockResolvedValue({ id: 'new-id', name: 'New case' })
  getCasesMock.mockResolvedValue({
    total: 1,
    items: [{ id: '1', name: 'Case 1' }],
  })
  updateCaseNameMock.mockResolvedValue({ id: '1', name: 'Renamed' })
  updateCaseSituationMock.mockResolvedValue({ id: '1', status: 'Concluído' })
  updateCaseCanViewMock.mockResolvedValue({ id: '1', can_view: true })
  deleteCaseMock.mockResolvedValue({ ok: true })
  getCaseByIdMock.mockResolvedValue({ id: '1', name: 'Case 1', status: 'Em andamento' })
  allowUserToViewCaseMock.mockResolvedValue({ ok: true })
  getCaseGraphMock.mockResolvedValue({ nodes: [], rels: [] })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useCase (addCase)', () => {
  it('exposes mutate/mutateAsync and calls service', async () => {
    const client = createClient()
    const wrapper = makeWrapper(client)
    const { result } = renderHook(() => useCase(), { wrapper })

    expect(typeof result.current.mutate).toBe('function')
    expect(typeof result.current.mutateAsync).toBe('function')

    await result.current.mutateAsync({ name: 'Test Case' })
    expect(addCaseMock).toHaveBeenCalledWith('Test Case')
  })
})

describe('useCases (getCases)', () => {
  it('calls service with given pagination/filters/sorting', async () => {
    const client = createClient()
    const wrapper = makeWrapper(client)

    const pagination = { page: 2, limit: 20 }
    const filters = { name: 'foo', owner: 'user', status: 'Em andamento' as const }
    const sorting = { sort_by: 'name' as const, sort_dir: 'asc' as const }

    const { result } = renderHook(
      () => useCases(pagination, filters, sorting),
      { wrapper }
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getCasesMock).toHaveBeenCalledWith(pagination, filters, sorting)
    expect(result.current.data?.items?.[0]?.id).toBe('1')
  })
})

describe('useUpdateCaseName', () => {
  it('invalidates ["case", id] and ["cases"] on success', async () => {
    const client = createClient()
    const wrapper = makeWrapper(client)
    const invSpy = vi.spyOn(client, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateCaseName(), { wrapper })

    await result.current.mutateAsync({ caseId: 'abc', name: 'New Name' })

    expect(updateCaseNameMock).toHaveBeenCalledWith('abc', 'New Name')

    expect(invSpy).toHaveBeenCalledWith({ queryKey: ['case', 'abc'] })
    expect(invSpy).toHaveBeenCalledWith({ queryKey: ['cases'] })
  })
})

describe('useUpdateCaseSituation', () => {
  it('invalidates ["case", id] and ["cases"] on success', async () => {
    const client = createClient()
    const wrapper = makeWrapper(client)
    const invSpy = vi.spyOn(client, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateCaseSituation(), { wrapper })

    await result.current.mutateAsync({ caseId: 'xyz', situation: 'Concluído' as any })

    expect(updateCaseSituationMock).toHaveBeenCalledWith('xyz', 'Concluído')
    expect(invSpy).toHaveBeenCalledWith({ queryKey: ['case', 'xyz'] })
    expect(invSpy).toHaveBeenCalledWith({ queryKey: ['cases'] })
  })
})

describe('useUpdateCaseCanView', () => {
  it('calls service with proper params', async () => {
    const client = createClient()
    const wrapper = makeWrapper(client)

    const { result } = renderHook(() => useUpdateCaseCanView(), { wrapper })
    await result.current.mutateAsync({ caseId: '1', canView: true })

    expect(updateCaseCanViewMock).toHaveBeenCalledWith('1', true)
  })
})

describe('useDeleteCase', () => {
  it('invalidates ["cases"] and ["case", id] on success', async () => {
    const client = createClient()
    const wrapper = makeWrapper(client)
    const invSpy = vi.spyOn(client, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteCase(), { wrapper })
    await result.current.mutateAsync('42')

    expect(deleteCaseMock).toHaveBeenCalledWith('42')
    expect(invSpy).toHaveBeenCalledWith({ queryKey: ['cases'] })
    expect(invSpy).toHaveBeenCalledWith({ queryKey: ['case', '42'] })
  })
})

describe('useCaseById', () => {
  it('fetches case by id and returns data', async () => {
    const client = createClient()
    const wrapper = makeWrapper(client)

    getCaseByIdMock.mockResolvedValueOnce({ id: '7', name: 'Case 7', status: 'Em andamento' })

    const { result } = renderHook(() => useCaseById('7'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getCaseByIdMock).toHaveBeenCalledWith('7')
    expect(result.current.data?.id).toBe('7')
  })
})

describe('useAllowVisualization', () => {
  it('calls service with (caseId, userId)', async () => {
    const client = createClient()
    const wrapper = makeWrapper(client)

    const { result } = renderHook(() => useAllowVisualization(), { wrapper })
    await result.current.mutateAsync({ caseId: 'case-1', userId: 'user-9' })

    expect(allowUserToViewCaseMock).toHaveBeenCalledWith('case-1', 'user-9')
  })
})

describe('useCaseGraph', () => {
  it('does not call service when caseId is falsy (enabled=false)', async () => {
    const client = createClient()
    const wrapper = makeWrapper(client)

    const { result } = renderHook(() => useCaseGraph(''), { wrapper })
    await waitFor(() => {
      expect(getCaseGraphMock).not.toHaveBeenCalled()
      expect(result.current.isFetching).toBe(false)
    })
  })

  it('calls service with caseId and filters when enabled', async () => {
    const client = createClient()
    const wrapper = makeWrapper(client)

    const filters = {
      investigated: 'yes',
      cpf_cnpj: '123',
      origin: 'SIMBA',
      archive: 'file.pdf',
    }

    const { result } = renderHook(() => useCaseGraph('abc', filters), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getCaseGraphMock).toHaveBeenCalledWith('abc', filters)
  })
})
