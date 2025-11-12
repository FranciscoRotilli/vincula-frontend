import { beforeEach,describe, expect, it, vi } from 'vitest'

import {
  ACCESS_COOKIE,
  clearAuthCookies,
  getTokensFromCookies,
  REFRESH_COOKIE,
  setAccessCookie,
  setRefreshCookie,
} from '@/lib/auth-cookies'

const setMock = vi.fn()
const getMock = vi.fn()
const deleteMock = vi.fn()

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      set: setMock,
      get: getMock,
      delete: deleteMock,
    })
  ),
}))

describe('auth-cookies utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('setAccessCookie sets cookie with short base and no expires if expSeconds is undefined', async () => {
    await setAccessCookie('abc123')
    expect(setMock).toHaveBeenCalledTimes(1)
    const [name, value, options] = setMock.mock.calls[0]
    expect(name).toBe(ACCESS_COOKIE)
    expect(value).toBe('abc123')
    expect(options).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    })
    expect(options.expires).toBeUndefined()
  })

  it('setAccessCookie sets cookie with expires when expSeconds provided', async () => {
    const now = Math.floor(Date.now() / 1000) + 60
    await setAccessCookie('token123', now)
    const [, , options] = setMock.mock.calls[0]
    expect(options.expires).toBeInstanceOf(Date)
    expect(Math.abs(options.expires.getTime() - now * 1000)).toBeLessThan(1000)
  })

  it('setRefreshCookie sets cookie with strict sameSite and optional expires', async () => {
    const exp = Math.floor(Date.now() / 1000) + 120
    await setRefreshCookie('ref123', exp)
    expect(setMock).toHaveBeenCalledTimes(1)
    const [name, value, options] = setMock.mock.calls[0]
    expect(name).toBe(REFRESH_COOKIE)
    expect(value).toBe('ref123')
    expect(options.sameSite).toBe('strict')
    expect(options.expires).toBeInstanceOf(Date)
  })

  it('setRefreshCookie works without expSeconds (no expires)', async () => {
    await setRefreshCookie('ref456')
    const [, , options] = setMock.mock.calls[0]
    expect(options.expires).toBeUndefined()
  })

  it('getTokensFromCookies returns both access and refresh tokens', async () => {
    getMock.mockImplementation((key: string) => {
      if (key === ACCESS_COOKIE) return { value: 'accessXYZ' }
      if (key === REFRESH_COOKIE) return { value: 'refreshXYZ' }
      return undefined
    })

    const result = await getTokensFromCookies()
    expect(result).toEqual({ access: 'accessXYZ', refresh: 'refreshXYZ' })
  })

  it('getTokensFromCookies returns undefined values when cookies missing', async () => {
    getMock.mockReturnValue(undefined)
    const result = await getTokensFromCookies()
    expect(result).toEqual({ access: undefined, refresh: undefined })
  })

  it('clearAuthCookies deletes both tokens', async () => {
    await clearAuthCookies()
    expect(deleteMock).toHaveBeenCalledTimes(2)
    expect(deleteMock).toHaveBeenNthCalledWith(1, ACCESS_COOKIE)
    expect(deleteMock).toHaveBeenNthCalledWith(2, REFRESH_COOKIE)
  })
})
