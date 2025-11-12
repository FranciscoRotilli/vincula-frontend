import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/backend', () => ({
  apiFetch: vi.fn(),
}))
const { apiFetch } = await import('@/lib/backend')

describe('API /user GET route', () => {
  beforeEach(() => {
    vi.resetModules() 
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls apiFetch and returns parsed JSON with same status', async () => {
    const serverStatus = 200
    const payload = [{ id: 'u1', name: 'Alice' }, { id: 'u2', name: 'Bob' }]
    const bodyText = JSON.stringify(payload)

    ;(apiFetch as unknown as vi.Mock).mockResolvedValueOnce({
      status: serverStatus,
      text: async () => bodyText,
    })

    const { GET } = await import('@/app/api/user/route')
    const res = await GET()

    expect(apiFetch).toHaveBeenCalledTimes(1)
    expect(apiFetch).toHaveBeenCalledWith('/user/', { method: 'GET' })

    expect(res).toBeInstanceOf(Response)
    expect(res.status).toBe(serverStatus)

    const json = await (res as Response).json()
    expect(json).toEqual(payload)
  })

  it('returns raw text and forces Content-Type application/json when body is not valid JSON', async () => {
    const serverStatus = 502
    const bodyText = 'upstream error'

    ;(apiFetch as unknown as vi.Mock).mockResolvedValueOnce({
      status: serverStatus,
      text: async () => bodyText,
    })

    const { GET } = await import('@/app/api/user/route')
    const res = await GET()

    expect(apiFetch).toHaveBeenCalledWith('/user/', { method: 'GET' })

    expect(res).toBeInstanceOf(Response)
    expect(res.status).toBe(serverStatus)
    expect(res.headers.get('content-type')).toBe('application/json')

    const text = await (res as Response).text()
    expect(text).toBe(bodyText)
  })

  it('propagates the error if apiFetch throws', async () => {
    ;(apiFetch as unknown as vi.Mock).mockRejectedValueOnce(new Error('network down'))

    const { GET } = await import('@/app/api/user/route')

    await expect(GET()).rejects.toThrow('network down')
    expect(apiFetch).toHaveBeenCalledWith('/user/', { method: 'GET' })
  })
})
