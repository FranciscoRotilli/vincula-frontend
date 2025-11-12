import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach,describe, expect, it, vi } from 'vitest'

import { useAddSuspect, useDeleteSuspect } from '@/hooks/useSuspect'
import * as suspectService from '@/services/suspectService'
import type { SuspectRequest } from '@/types/Cases'

vi.mock('@/services/suspectService')

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return Wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useAddSuspect', () => {
  it('initializes with idle state', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useAddSuspect(), { wrapper })

    expect(result.current.isPending).toBe(false)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(typeof result.current.mutate).toBe('function')
    expect(typeof result.current.mutateAsync).toBe('function')
  })

  it('calls addSuspect (mutate) and resolves success', async () => {
    const wrapper = createWrapper()
    const caseId = 'case-001'
    const newSuspect: SuspectRequest = { name: 'Jane Doe', cpf: '987.654.321-00' }

    ;(suspectService.addSuspect as any).mockResolvedValue({
      id: 'sus-1',
      ...newSuspect,
    })

    const { result } = renderHook(() => useAddSuspect(), { wrapper })

    act(() => {
      result.current.mutate({ caseId, newSuspect })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(suspectService.addSuspect).toHaveBeenCalledTimes(1)
    expect(suspectService.addSuspect).toHaveBeenCalledWith(caseId, newSuspect)
    expect(result.current.data).toMatchObject({ id: 'sus-1' })
  })

  it('calls addSuspect (mutateAsync) and returns data', async () => {
  const wrapper = createWrapper()
  const caseId = 'case-002'
  const newSuspect: SuspectRequest = { name: 'John', cpf: '111.222.333-44' }

  ;(suspectService.addSuspect as any).mockResolvedValue({
    id: 'sus-2',
    ...newSuspect,
  })

  const { result } = renderHook(() => useAddSuspect(), { wrapper })

  const data = await result.current.mutateAsync({ caseId, newSuspect })
  expect(suspectService.addSuspect).toHaveBeenCalledWith(caseId, newSuspect)
  expect(data).toMatchObject({ id: 'sus-2' })

  await waitFor(() => expect(result.current.isSuccess).toBe(true))
})

  it('handles addSuspect error state', async () => {
    const wrapper = createWrapper()
    const caseId = 'case-003'
    const newSuspect: SuspectRequest = { name: 'Error Guy', cpf: '000.000.000-00' }
    const err = new Error('add failed')

    ;(suspectService.addSuspect as any).mockRejectedValue(err)

    const { result } = renderHook(() => useAddSuspect(), { wrapper })

    act(() => {
      result.current.mutate({ caseId, newSuspect })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBe(err)
  })
})

describe('useDeleteSuspect', () => {
  it('initializes with idle state', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useDeleteSuspect(), { wrapper })

    expect(result.current.isPending).toBe(false)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(typeof result.current.mutate).toBe('function')
    expect(typeof result.current.mutateAsync).toBe('function')
  })

  it('calls deleteSuspect (mutate) and resolves success', async () => {
    const wrapper = createWrapper()
    const caseId = 'case-010'
    const suspectId = 'sus-99'

    ;(suspectService.deleteSuspect as any).mockResolvedValue({ ok: true })

    const { result } = renderHook(() => useDeleteSuspect(), { wrapper })

    act(() => {
      result.current.mutate({ caseId, suspectId })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(suspectService.deleteSuspect).toHaveBeenCalledTimes(1)
    expect(suspectService.deleteSuspect).toHaveBeenCalledWith(caseId, suspectId)
    expect(result.current.data).toMatchObject({ ok: true })
  })

it('calls deleteSuspect (mutateAsync) and returns data', async () => {
  const wrapper = createWrapper()
  const caseId = 'case-011'
  const suspectId = 'sus-77'

  ;(suspectService.deleteSuspect as any).mockResolvedValue({ ok: true })

  const { result } = renderHook(() => useDeleteSuspect(), { wrapper })

  const data = await result.current.mutateAsync({ caseId, suspectId })
  expect(suspectService.deleteSuspect).toHaveBeenCalledWith(caseId, suspectId)
  expect(data).toMatchObject({ ok: true })

  await waitFor(() => expect(result.current.isSuccess).toBe(true))
})

  it('handles deleteSuspect error state', async () => {
    const wrapper = createWrapper()
    const caseId = 'case-012'
    const suspectId = 'sus-404'
    const err = new Error('delete failed')

    ;(suspectService.deleteSuspect as any).mockRejectedValue(err)

    const { result } = renderHook(() => useDeleteSuspect(), { wrapper })

    act(() => {
      result.current.mutate({ caseId, suspectId })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBe(err)
  })
})
