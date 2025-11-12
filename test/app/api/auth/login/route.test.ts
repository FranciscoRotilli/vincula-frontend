import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth-cookies', () => ({
  setAccessCookie: vi.fn(),
  setRefreshCookie: vi.fn(),
}))
const { setAccessCookie, setRefreshCookie } = await import('@/lib/auth-cookies')

describe('API /auth/login POST route', () => {
  const API_URL = 'http://fake-api.example'

  beforeEach(() => {
    vi.resetModules() 
    vi.resetAllMocks()
    process.env.NEXT_PUBLIC_API_URL = API_URL
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns 200, body { user, role } and sets cookies on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        user: 'john',
        role: 'admin',
        access_token: 'acc-123',
        refresh_token: 'ref-456',
      }),
    }))

    const { POST } = await import('@/app/api/auth/login/route')

    const reqBody = { username: 'john', password: 'secret' }
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqBody),
    })

    const res = await POST(req)

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/auth/login`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody),
        cache: 'no-store',
      }),
    )

    expect(setAccessCookie).toHaveBeenCalledWith('acc-123')
    expect(setRefreshCookie).toHaveBeenCalledWith('ref-456')

    expect(res.status).toBe(200)
    const body = await (res as Response).json()
    expect(body).toEqual({ user: 'john', role: 'admin' })
  })

  it('propagates status and JSON error when API returns error with JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'invalid credentials' }),
    }))

    const { POST } = await import('@/app/api/auth/login/route')

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'x', password: 'y' }),
    })

    const res = await POST(req)

    expect(res.status).toBe(401)
    const body = await (res as Response).json()
    expect(body).toEqual({ message: 'invalid credentials' })
    expect(setAccessCookie).not.toHaveBeenCalled()
    expect(setRefreshCookie).not.toHaveBeenCalled()
  })

  it('returns {} when API fails to parse JSON error response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => { throw new Error('invalid json') },
    }))

    const { POST } = await import('@/app/api/auth/login/route')

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'x', password: 'y' }),
    })

    const res = await POST(req)

    expect(res.status).toBe(500)
    const body = await (res as Response).json()
    expect(body).toEqual({})
    expect(setAccessCookie).not.toHaveBeenCalled()
    expect(setRefreshCookie).not.toHaveBeenCalled()
  })
})
