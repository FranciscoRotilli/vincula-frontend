import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/backend', () => ({
  apiFetch: vi.fn(),
}))
const { apiFetch } = await import('@/lib/backend')

describe('API /case/[caseId]/graph GET route', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls apiFetch with interpolated caseId and query string, and returns parsed JSON with same status', async () => {
    const serverStatus = 200
    const payload = { nodes: [], rels: [] }
    const bodyText = JSON.stringify(payload)

    ;(apiFetch as unknown as vi.Mock).mockResolvedValueOnce({
      status: serverStatus,
      text: async () => bodyText,
    })

    const { GET } = await import('@/app/api/case/[caseId]/graph/route')

    const url = new URL('http://localhost/api/case/123/graph?foo=bar&x=1')
    const nextReq = { nextUrl: url } as any
    const params = Promise.resolve({ caseId: '123' })

    const res = await GET(nextReq, { params } as any)

    expect(apiFetch).toHaveBeenCalledTimes(1)
    expect(apiFetch).toHaveBeenCalledWith('/case/123/graph?foo=bar&x=1', { method: 'GET' })

    expect(res).toBeInstanceOf(Response)
    expect(res.status).toBe(serverStatus)

    const json = await (res as Response).json()
    expect(json).toEqual(payload)
  })

  it('returns raw text with Content-Type application/json when response is not valid JSON', async () => {
    const serverStatus = 502
    const bodyText = 'upstream error html or text'

    ;(apiFetch as unknown as vi.Mock).mockResolvedValueOnce({
      status: serverStatus,
      text: async () => bodyText, 
    })

    const { GET } = await import('@/app/api/case/[caseId]/graph/route')

    const url = new URL('http://localhost/api/case/999/graph') 
    const nextReq = { nextUrl: url } as any
    const params = Promise.resolve({ caseId: '999' })

    const res = await GET(nextReq, { params } as any)

    expect(apiFetch).toHaveBeenCalledWith('/case/999/graph', { method: 'GET' })

    expect(res).toBeInstanceOf(Response)
    expect(res.status).toBe(serverStatus)
    expect(res.headers.get('content-type')).toBe('application/json')

    const text = await (res as Response).text()
    expect(text).toBe(bodyText)
  })

  it('propagates the error if apiFetch throws', async () => {
    ;(apiFetch as unknown as vi.Mock).mockRejectedValueOnce(new Error('network down'))

    const { GET } = await import('@/app/api/case/[caseId]/graph/route')

    const url = new URL('http://localhost/api/case/777/graph?debug=true')
    const nextReq = { nextUrl: url } as any
    const params = Promise.resolve({ caseId: '777' })

    await expect(GET(nextReq, { params } as any)).rejects.toThrow('network down')
    expect(apiFetch).toHaveBeenCalledWith('/case/777/graph?debug=true', { method: 'GET' })
  })
})
