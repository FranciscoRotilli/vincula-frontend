import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest'

const cookiesMock = vi.fn()
vi.mock('next/headers', () => ({
  cookies: cookiesMock,
}))

vi.mock('@/lib/auth-refresh', () => ({
  tryRefreshAndGetAccess: vi.fn(),
}))
import { tryRefreshAndGetAccess } from '@/lib/auth-refresh'

const fetchMock = vi.fn()

describe('apiFetch / apiFetchFormData', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    process.env = { ...OLD_ENV, NEXT_PUBLIC_API_URL: 'https://api.example.com' }
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    process.env = OLD_ENV
  })

  function setCookieJar(access?: string) {
    cookiesMock.mockResolvedValue({
      get: (name: string) => (name === 'access_token' && access ? { value: access } : undefined),
      set: vi.fn(),
      delete: vi.fn(),
    })
  }

  it('apiFetch: no access cookie → no Authorization header', async () => {
    setCookieJar(undefined)
    fetchMock.mockResolvedValue({ status: 200 })

    const { apiFetch } = await import('@/lib/backend')

    await apiFetch('/cases', { method: 'GET', headers: { 'X-Custom': '1' } })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.example.com/cases')
    expect(init).toMatchObject({
      method: 'GET',
      cache: 'no-store',
    })

    expect((init as any).headers).toMatchObject({
      'Content-Type': 'application/json',
      'X-Custom': '1',
    })
    expect((init as any).headers.Authorization).toBeUndefined()
  })

  it('apiFetch: with access cookie → sends Authorization header', async () => {
    setCookieJar('token-123')
    fetchMock.mockResolvedValue({ status: 200 })

    const { apiFetch } = await import('@/lib/backend')

    await apiFetch('/cases', { method: 'POST', body: JSON.stringify({ x: 1 }) })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.example.com/cases')
    expect((init as any).headers.Authorization).toBe('Bearer token-123')
    expect((init as any).headers['Content-Type']).toBe('application/json')
    expect(init).toMatchObject({ cache: 'no-store' })
  })

  it('apiFetch: 401 and refresh returns null → does not retry', async () => {
    setCookieJar('old-token')
    ;(tryRefreshAndGetAccess as vi.Mock).mockResolvedValue(null)
    fetchMock.mockResolvedValueOnce({ status: 401 }) 
    const { apiFetch } = await import('@/lib/backend')

    const resp = await apiFetch('/x', { method: 'GET' })
    expect(resp.status).toBe(401)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.example.com/x')
    expect((init as any).headers.Authorization).toBe('Bearer old-token')
  })

  it('apiFetch: 401 and refresh returns new token → retries with new Authorization', async () => {
    setCookieJar('old-token')
    ;(tryRefreshAndGetAccess as vi.Mock).mockResolvedValue('new-token')
    fetchMock
      .mockResolvedValueOnce({ status: 401 })        
      .mockResolvedValueOnce({ status: 200 })        

    const { apiFetch } = await import('@/lib/backend')

    const resp = await apiFetch('/retry', { method: 'GET' })
    expect(resp.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(2)

    const [, init2] = fetchMock.mock.calls[1]
    expect((init2 as any).headers.Authorization).toBe('Bearer new-token')
  })

  it('apiFetchFormData: default POST, passes content-type/body, adds duplex, Authorization from cookie', async () => {
    setCookieJar('file-token')
    fetchMock.mockResolvedValue({ status: 200 })

    const req: any = {
      headers: {
        get: (h: string) => (h.toLowerCase() === 'content-type' ? 'multipart/form-data; boundary=abc' : null),
      },
      body: 'STREAM-BODY',
    }

    const { apiFetchFormData } =await import('@/lib/backend')


    await apiFetchFormData('/files/upload', req) 

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.example.com/files/upload')
    expect((init as any).method).toBe('POST')
    expect((init as any).cache).toBe('no-store')
    expect((init as any).duplex).toBe('half')
    expect((init as any).headers).toMatchObject({
      'Content-Type': 'multipart/form-data; boundary=abc',
      Authorization: 'Bearer file-token',
    })
    expect((init as any).body).toBe('STREAM-BODY')
  })

  it('apiFetchFormData: method override PUT and 401 → refresh then retry with new token', async () => {
    setCookieJar('tok-1')
    ;(tryRefreshAndGetAccess as vi.Mock).mockResolvedValue('tok-2')
    fetchMock
      .mockResolvedValueOnce({ status: 401 })
      .mockResolvedValueOnce({ status: 200 }) 

    const req: any = {
      headers: { get: () => 'multipart/form-data; boundary=xyz' },
      body: 'B',
    }

    const { apiFetchFormData } = await import('@/lib/backend')

    const resp = await apiFetchFormData('/files/put', req, 'PUT')
    expect(resp.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(2)

    const [, init2] = fetchMock.mock.calls[1]
    expect((init2 as any).method).toBe('PUT')
    expect((init2 as any).headers.Authorization).toBe('Bearer tok-2')
    expect((init2 as any).duplex).toBe('half')
  })
})
