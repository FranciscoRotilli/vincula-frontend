import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach,describe, expect, it, vi } from 'vitest'

import { useAddFile,useRemoveFile } from '@/hooks/useFile'
import * as fileService from '@/services/fileService'
import type { FileRequest } from '@/types/Files'

vi.mock('@/services/fileService')

const createClientAndWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return { client, Wrapper }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useRemoveFile(caseId)', () => {
  it('initializes idle and exposes mutate APIs', () => {
    const { Wrapper } = createClientAndWrapper()
    const { result } = renderHook(() => useRemoveFile('case-abc'), { wrapper: Wrapper })

    expect(result.current.isPending).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeNull()
    expect(typeof result.current.mutate).toBe('function')
    expect(typeof result.current.mutateAsync).toBe('function')
  })

  it('calls removeFile with correct params (mutate) and invalidates case query on success', async () => {
    const { client, Wrapper } = createClientAndWrapper()
    const caseId = 'case-123'
    const fileId = 'file-999'

    const removeSpy = vi.spyOn(fileService, 'removeFile').mockResolvedValue({ ok: true } as any)
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries')

    const { result } = renderHook(() => useRemoveFile(caseId), { wrapper: Wrapper })

    act(() => {
      result.current.mutate(fileId)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(removeSpy).toHaveBeenCalledTimes(1)
    expect(removeSpy).toHaveBeenCalledWith(caseId, fileId)

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['case', caseId] })
  })

  it('calls removeFile with correct params (mutateAsync) and flips success', async () => {
    const { client, Wrapper } = createClientAndWrapper()
    const caseId = 'case-456'
    const fileId = 'file-111'

    vi.spyOn(fileService, 'removeFile').mockResolvedValue({ ok: true } as any)
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries')

    const { result } = renderHook(() => useRemoveFile(caseId), { wrapper: Wrapper })

    const data = await result.current.mutateAsync(fileId)
    expect(fileService.removeFile).toHaveBeenCalledWith(caseId, fileId)
    expect(data).toMatchObject({ ok: true })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['case', caseId] })
  })

  it('handles error state when removeFile rejects', async () => {
    const { Wrapper } = createClientAndWrapper()
    const err = new Error('remove failed')
    vi.spyOn(fileService, 'removeFile').mockRejectedValue(err)

    const { result } = renderHook(() => useRemoveFile('case-err'), { wrapper: Wrapper })

    act(() => {
      result.current.mutate('file-bad')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBe(err)
  })
})

describe('useAddFile()', () => {
  it('initializes idle and exposes mutate APIs', () => {
    const { Wrapper } = createClientAndWrapper()
    const { result } = renderHook(() => useAddFile(), { wrapper: Wrapper })

    expect(result.current.isPending).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeNull()
    expect(typeof result.current.mutate).toBe('function')
    expect(typeof result.current.mutateAsync).toBe('function')
  })

  it('calls addFile with correct params (mutate) and resolves success', async () => {
    const { Wrapper } = createClientAndWrapper()
    const caseId = 'case-777'
    const newFile: FileRequest = {
      name: 'doc.pdf',
      type: 'application/pdf',
      url: 'https://example.com/doc.pdf',
    } as any

    const addSpy = vi.spyOn(fileService, 'addFile').mockResolvedValue({ id: 'file-new' } as any)

    const { result } = renderHook(() => useAddFile(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate({ caseId, newFile })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(addSpy).toHaveBeenCalledTimes(1)
    expect(addSpy).toHaveBeenCalledWith(caseId, newFile)
    expect(result.current.data).toMatchObject({ id: 'file-new' })
  })

  it('calls addFile with correct params (mutateAsync) and returns data', async () => {
    const { Wrapper } = createClientAndWrapper()
    const caseId = 'case-888'
    const newFile: FileRequest = { name: 'img.png', type: 'image/png', url: '/img.png' } as any

    vi.spyOn(fileService, 'addFile').mockResolvedValue({ id: 'file-async' } as any)

    const { result } = renderHook(() => useAddFile(), { wrapper: Wrapper })

    const data = await result.current.mutateAsync({ caseId, newFile })
    expect(fileService.addFile).toHaveBeenCalledWith(caseId, newFile)
    expect(data).toMatchObject({ id: 'file-async' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('handles error state when addFile rejects', async () => {
    const { Wrapper } = createClientAndWrapper()
    const caseId = 'case-err'
    const newFile: FileRequest = { name: 'bad.txt', type: 'text/plain', url: '/bad' } as any
    const err = new Error('add failed')

    vi.spyOn(fileService, 'addFile').mockRejectedValue(err)

    const { result } = renderHook(() => useAddFile(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate({ caseId, newFile })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBe(err)
  })
})
