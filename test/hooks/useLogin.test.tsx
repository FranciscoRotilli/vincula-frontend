import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach,describe, expect, it, vi } from 'vitest'

import { useLogin } from '@/hooks/useLogin'
import * as authService from '@/services/auth'

vi.mock('@/services/auth')

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

describe('useLogin', () => {
  it('initializes with idle state and exposes mutate APIs', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useLogin(), { wrapper })

    expect(result.current.isPending).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeNull()
    expect(typeof result.current.mutate).toBe('function')
    expect(typeof result.current.mutateAsync).toBe('function')
  })

  it('calls auth.login on mutate and sets success state', async () => {
    const wrapper = createWrapper()
    const loginSpy = vi.spyOn(authService, 'login').mockResolvedValue({
      token: 'jwt-token',
      user: { id: 'u1', username: 'alice' },
    } as any)

    const { result } = renderHook(() => useLogin(), { wrapper })

    act(() => {
      result.current.mutate({ username: 'alice', password: 'secret' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(loginSpy).toHaveBeenCalledTimes(1)
    expect(loginSpy).toHaveBeenCalledWith('alice', 'secret')
    expect(result.current.data).toMatchObject({ token: 'jwt-token' })
  })

  it('calls auth.login on mutateAsync, returns data, then success state flips', async () => {
    const wrapper = createWrapper()
    vi.spyOn(authService, 'login').mockResolvedValue({
      token: 'another-token',
      user: { id: 'u2', username: 'bob' },
    } as any)

    const { result } = renderHook(() => useLogin(), { wrapper })

    const data = await result.current.mutateAsync({ username: 'bob', password: 'pass123' })
    expect(authService.login).toHaveBeenCalledWith('bob', 'pass123')
    expect(data).toMatchObject({ token: 'another-token' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('handles error state when auth.login rejects', async () => {
    const wrapper = createWrapper()
    const err = new Error('invalid credentials')
    vi.spyOn(authService, 'login').mockRejectedValue(err)

    const { result } = renderHook(() => useLogin(), { wrapper })

    act(() => {
      result.current.mutate({ username: 'eve', password: 'wrong' })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBe(err)
  })
})
