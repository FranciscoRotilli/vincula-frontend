import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth-cookies', () => ({
  getTokensFromCookies: vi.fn(),
  setAccessCookie: vi.fn(),
}))

import { getTokensFromCookies, setAccessCookie } from '@/lib/auth-cookies'

const fetchMock = vi.fn()

describe('tryRefreshAndGetAccess', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    process.env = { ...OLD_ENV }
    vi.stubGlobal('fetch', fetchMock) 
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    process.env = OLD_ENV
  })

  it('returns null if there is no refresh token in cookies', async () => {
    ;(getTokensFromCookies as vi.Mock).mockResolvedValue({ access: undefined, refresh: undefined })

    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com'
    const { tryRefreshAndGetAccess } = await import('@/lib/auth-refresh')

    const result = await tryRefreshAndGetAccess()

    expect(result).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(setAccessCookie).not.toHaveBeenCalled()
  })

  it('returns null if refresh request is not ok', async () => {
    ;(getTokensFromCookies as vi.Mock).mockResolvedValue({ access: 'a', refresh: 'r-token' })
    fetchMock.mockResolvedValue({ ok: false, json: vi.fn() })

    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com'
    const { tryRefreshAndGetAccess } = await import('@/lib/auth-refresh')

    const result = await tryRefreshAndGetAccess()

    expect(result).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.example.com/auth/refresh')
    expect(init).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    expect(JSON.parse((init as any).body)).toEqual({ refresh_token: 'r-token' })
    expect(setAccessCookie).not.toHaveBeenCalled()
  })

  it('sets access cookie and returns access token when refresh succeeds', async () => {
    ;(getTokensFromCookies as vi.Mock).mockResolvedValue({ access: 'old', refresh: 'refresh-123' })
    const jsonMock = vi.fn().mockResolvedValue({ access_token: 'new-access' })
    fetchMock.mockResolvedValue({ ok: true, json: jsonMock })

    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com'
    const { tryRefreshAndGetAccess } = await import('@/lib/auth-refresh')

    const result = await tryRefreshAndGetAccess()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.example.com/auth/refresh')
    expect(init).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    expect(JSON.parse((init as any).body)).toEqual({ refresh_token: 'refresh-123' })

    expect(jsonMock).toHaveBeenCalled()
    expect(setAccessCookie).toHaveBeenCalledWith('new-access')
    expect(result).toBe('new-access')
  })
})
