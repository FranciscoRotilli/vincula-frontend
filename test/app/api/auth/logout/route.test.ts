import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth-cookies', () => ({
  clearAuthCookies: vi.fn(),
}))
const { clearAuthCookies } = await import('@/lib/auth-cookies')

describe('API /auth/logout POST route', () => {
  beforeEach(() => {
    vi.resetModules() 
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls clearAuthCookies and returns { ok: true } with status 200', async () => {
    ;(clearAuthCookies as unknown as vi.Mock).mockResolvedValueOnce(undefined)

    const { POST } = await import('@/app/api/auth/logout/route')

    const req = new Request('http://localhost/api/auth/logout', { method: 'POST' })
    const res = await POST(req as any)

    expect(clearAuthCookies).toHaveBeenCalledTimes(1)

    expect(res).toBeInstanceOf(Response)
    expect(res.status).toBe(200)

    const body = await (res as Response).json()
    expect(body).toEqual({ ok: true })
  })

  it('propagates the error if clearAuthCookies rejects', async () => {
    ;(clearAuthCookies as unknown as vi.Mock).mockRejectedValueOnce(new Error('boom'))

    const { POST } = await import('@/app/api/auth/logout/route')

    const req = new Request('http://localhost/api/auth/logout', { method: 'POST' })

    await expect(POST(req as any)).rejects.toThrow('boom')
    expect(clearAuthCookies).toHaveBeenCalledTimes(1)
  })
})
