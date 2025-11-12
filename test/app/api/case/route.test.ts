import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/backend', () => ({
  apiFetch: vi.fn(),
}))
const { apiFetch } = await import('@/lib/backend')

describe('API /case route (GET, POST)', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // ------------- GET -------------
  describe('GET', () => {
    it('calls apiFetch with the query string and returns parsed JSON with same status', async () => {
      const serverStatus = 200
      const payload = { items: [1, 2, 3], total: 3 }
      const bodyText = JSON.stringify(payload)

      ;(apiFetch as unknown as vi.Mock).mockResolvedValueOnce({
        status: serverStatus,
        text: async () => bodyText,
      })

      const { GET } = await import('@/app/api/case/route')

      const url = new URL('http://localhost/api/case?owner=me&open=true')
      const nextReq = { nextUrl: url } as any

      const res = await GET(nextReq)

      expect(apiFetch).toHaveBeenCalledTimes(1)
      expect(apiFetch).toHaveBeenCalledWith('/case/?owner=me&open=true', { method: 'GET' })

      expect(res).toBeInstanceOf(Response)
      expect(res.status).toBe(serverStatus)
      const json = await (res as Response).json()
      expect(json).toEqual(payload)
    })

    it('returns raw text and forces Content-Type application/json when body is not valid JSON', async () => {
      const serverStatus = 502
      const bodyText = 'gateway error (html/text)'

      ;(apiFetch as unknown as vi.Mock).mockResolvedValueOnce({
        status: serverStatus,
        text: async () => bodyText,
      })

      const { GET } = await import('@/app/api/case/route')

      const url = new URL('http://localhost/api/case') 
      const nextReq = { nextUrl: url } as any

      const res = await GET(nextReq)

      expect(apiFetch).toHaveBeenCalledWith('/case/', { method: 'GET' })

      expect(res).toBeInstanceOf(Response)
      expect(res.status).toBe(serverStatus)
      expect(res.headers.get('content-type')).toBe('application/json')
      const text = await (res as Response).text()
      expect(text).toBe(bodyText)
    })

    it('propagates the error if apiFetch throws', async () => {
      ;(apiFetch as unknown as vi.Mock).mockRejectedValueOnce(new Error('network down'))

      const { GET } = await import('@/app/api/case/route')

      const url = new URL('http://localhost/api/case?x=1')
      const nextReq = { nextUrl: url } as any

      await expect(GET(nextReq)).rejects.toThrow('network down')
    })
  })

  // ------------- POST -------------
  describe('POST', () => {
    it('calls apiFetch with body and returns parsed JSON with same status', async () => {
      const reqBody = { title: 'New Case', owner: 'alice' }
      const serverStatus = 201
      const serverJson = { id: 'case-001', ...reqBody }

      ;(apiFetch as unknown as vi.Mock).mockResolvedValueOnce({
        status: serverStatus,
        text: async () => JSON.stringify(serverJson),
      })

      const { POST } = await import('@/app/api/case/route')

      const req = new Request('http://localhost/api/case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody),
      }) as any

      const res = await POST(req)

      expect(apiFetch).toHaveBeenCalledTimes(1)
      expect(apiFetch).toHaveBeenCalledWith('/case/', {
        method: 'POST',
        body: JSON.stringify(reqBody),
      })

      expect(res).toBeInstanceOf(Response)
      expect(res.status).toBe(serverStatus)
      const json = await (res as Response).json()
      expect(json).toEqual(serverJson)
    })

    it('falls back to raw text and forces Content-Type application/json when body is not valid JSON', async () => {
      const serverStatus = 400
      const bodyText = 'invalid payload'

      ;(apiFetch as unknown as vi.Mock).mockResolvedValueOnce({
        status: serverStatus,
        text: async () => bodyText,
      })

      const { POST } = await import('@/app/api/case/route')

      const req = new Request('http://localhost/api/case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bad: 'data' }),
      }) as any

      const res = await POST(req)

      expect(apiFetch).toHaveBeenCalledWith('/case/', {
        method: 'POST',
        body: JSON.stringify({ bad: 'data' }),
      })

      expect(res).toBeInstanceOf(Response)
      expect(res.status).toBe(serverStatus)
      expect(res.headers.get('content-type')).toBe('application/json')
      const text = await (res as Response).text()
      expect(text).toBe(bodyText)
    })

    it('propagates the error if apiFetch throws', async () => {
      ;(apiFetch as unknown as vi.Mock).mockRejectedValueOnce(new Error('timeout'))

      const { POST } = await import('@/app/api/case/route')

      const req = new Request('http://localhost/api/case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Case' }),
      }) as any

      await expect(POST(req)).rejects.toThrow('timeout')
    })
  })
})
