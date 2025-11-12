import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth-refresh', () => ({
  tryRefreshAndGetAccess: vi.fn(),
}))
const { tryRefreshAndGetAccess } = await import('@/lib/auth-refresh')

describe('API /auth/refresh POST route', () => {
  beforeEach(() => {
    vi.resetModules() 
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns 200 and { ok: true } when token is successfully refreshed', async () => {
    ;(tryRefreshAndGetAccess as unknown as vi.Mock).mockResolvedValueOnce('new-access-token')

    const { POST } = await import('@/app/api/auth/refresh/route')

    const req = new Request('http://localhost/api/auth/refresh', { method: 'POST' })
    const res = await POST(req as any)

    expect(tryRefreshAndGetAccess).toHaveBeenCalledTimes(1)

    expect(res).toBeInstanceOf(Response)
    expect(res.status).toBe(200)

    const body = await (res as Response).json()
    expect(body).toEqual({ ok: true })
  })

  it('returns 401 and { ok: false } when token refresh fails', async () => {
    ;(tryRefreshAndGetAccess as unknown as vi.Mock).mockResolvedValueOnce(null)

    const { POST } = await import('@/app/api/auth/refresh/route')

    const req = new Request('http://localhost/api/auth/refresh', { method: 'POST' })
    const res = await POST(req as any)

    expect(tryRefreshAndGetAccess).toHaveBeenCalledTimes(1)
    expect(res).toBeInstanceOf(Response)
    expect(res.status).toBe(401)

    const body = await (res as Response).json()
    expect(body).toEqual({ ok: false })
  })

  it('propagates the error if tryRefreshAndGetAccess throws an exception', async () => {
    ;(tryRefreshAndGetAccess as unknown as vi.Mock).mockRejectedValueOnce(new Error('refresh failed'))

    const { POST } = await import('@/app/api/auth/refresh/route')

    const req = new Request('http://localhost/api/auth/refresh', { method: 'POST' })

    await expect(POST(req as any)).rejects.toThrow('refresh failed')
    expect(tryRefreshAndGetAccess).toHaveBeenCalledTimes(1)
  })
})
