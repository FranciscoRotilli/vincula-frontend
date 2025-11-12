import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useUsers } from '@/hooks/useUsers'

type FetchCall = [RequestInfo, RequestInit?]

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

describe('useUsers', () => {
  const fetchMock = vi.fn<[], Promise<Response>>()
  let client: QueryClient

  const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )

  beforeEach(() => {
    client = createClient()
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
  })

  afterEach(() => {
    client.clear()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('returns users on success and calls fetch with expected options', async () => {
    const users = [
      { id: '1', name: 'Ada' },
      { id: '2', name: 'Grace' },
    ]

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => users,
    } as Response)

    const { result } = renderHook(() => useUsers(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(users)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as FetchCall
    expect(url).toBe('/api/users')
    expect(init).toMatchObject({
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
  })

  it('sets error when response is not ok', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'nope' }),
    } as Response)

    const { result } = renderHook(() => useUsers(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('Falha ao buscar usuários (status 500)')

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
