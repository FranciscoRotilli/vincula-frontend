import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('jose', () => ({
  jwtVerify: vi.fn(),
}))
vi.mock('@/lib/auth-cookies', () => ({
  getTokensFromCookies: vi.fn(),
}))
vi.mock('@/lib/auth-refresh', () => ({
  tryRefreshAndGetAccess: vi.fn(),
}))

const { jwtVerify } = await import('jose')
const { getTokensFromCookies } = await import('@/lib/auth-cookies')
const { tryRefreshAndGetAccess } = await import('@/lib/auth-refresh')

describe('API /me GET route', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.resetAllMocks()
    process.env.JWT_SECRET = 'mysecret'
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns 401 when there is no access token', async () => {
    ;(getTokensFromCookies as unknown as vi.Mock).mockResolvedValueOnce({ access: null })
    const { GET } = await import('@/app/api/me/route')

    const res = await GET()
    expect(res).toBeInstanceOf(Response)
    expect(res.status).toBe(401)
    const body = await (res as Response).json()
    expect(body).toEqual({ error: 'Not logged in' })
  })

  it('returns username and role when JWT verification succeeds', async () => {
    ;(getTokensFromCookies as unknown as vi.Mock).mockResolvedValueOnce({
      access: 'valid.jwt.token',
    })
    ;(jwtVerify as unknown as vi.Mock).mockResolvedValueOnce({
      payload: { username: 'alice', role: 'admin' },
    })

    const { GET } = await import('@/app/api/me/route')
    const res = await GET()

    const calls = (jwtVerify as unknown as vi.Mock).mock.calls
    expect(calls.length).toBe(1)
    expect(calls[0][0]).toBe('valid.jwt.token')

    const expectedSecretBytes = new TextEncoder().encode(process.env.JWT_SECRET!)
    const actualSecretArg = calls[0][1] as Uint8Array
    expect(Array.from(actualSecretArg)).toEqual(Array.from(expectedSecretBytes))

    expect(res).toBeInstanceOf(Response)
    expect(res.status).toBe(200)
    const body = await (res as Response).json()
    expect(body).toEqual({ username: 'alice', role: 'admin' })
  })

  it('attempts token refresh when jwtVerify throws, and uses new token successfully', async () => {
    ;(getTokensFromCookies as unknown as vi.Mock).mockResolvedValueOnce({
      access: 'expired.token',
    })
    ;(jwtVerify as unknown as vi.Mock)
      .mockRejectedValueOnce(new Error('expired'))
      .mockResolvedValueOnce({ payload: { username: 'bob', role: 'user' } })
    ;(tryRefreshAndGetAccess as unknown as vi.Mock).mockResolvedValueOnce('new.token')

    const { GET } = await import('@/app/api/me/route')
    const res = await GET()

    expect(tryRefreshAndGetAccess).toHaveBeenCalled()
    expect((jwtVerify as unknown as vi.Mock).mock.calls.length).toBe(2)
    expect(res.status).toBe(200)
    const body = await (res as Response).json()
    expect(body).toEqual({ username: 'bob', role: 'user' })
  })

  it('returns 500 if new token is refreshed but still invalid', async () => {
    ;(getTokensFromCookies as unknown as vi.Mock).mockResolvedValueOnce({
      access: 'expired.token',
    })
    ;(jwtVerify as unknown as vi.Mock)
      .mockRejectedValueOnce(new Error('expired'))
      .mockRejectedValueOnce(new Error('invalid new token'))
    ;(tryRefreshAndGetAccess as unknown as vi.Mock).mockResolvedValueOnce('new.token')

    const { GET } = await import('@/app/api/me/route')
    const res = await GET()

    expect(res.status).toBe(500)
    const body = await (res as Response).json()
    expect(body).toEqual({ error: 'Failed to process new token' })
  })

  it('returns 401 when token is invalid and cannot be refreshed', async () => {
    ;(getTokensFromCookies as unknown as vi.Mock).mockResolvedValueOnce({
      access: 'expired.token',
    })
    ;(jwtVerify as unknown as vi.Mock).mockRejectedValueOnce(new Error('expired'))
    ;(tryRefreshAndGetAccess as unknown as vi.Mock).mockResolvedValueOnce(null)

    const { GET } = await import('@/app/api/me/route')
    const res = await GET()

    expect(res.status).toBe(401)
    const body = await (res as Response).json()
    expect(body).toEqual({ error: 'Invalid token' })
  })
})
