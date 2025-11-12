import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/backend', () => ({
  apiFetch: vi.fn(),
}))
const { apiFetch } = await import('@/lib/backend')

describe('API /case/[caseId]/files/[fileId] DELETE route', () => {
  beforeEach(() => {
    vi.resetModules() 
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns JSON when content-type is application/json and body is not empty', async () => {
    const serverStatus = 200
    const payload = { ok: true, removed: 1 }
    const bodyText = JSON.stringify(payload)
    const headers = new Headers({ 'content-type': 'application/json; charset=utf-8' })

    ;(apiFetch as unknown as vi.Mock).mockResolvedValueOnce({
      status: serverStatus,
      headers,
      text: async () => bodyText,
    })

    const { DELETE } = await import('@/app/api/case/[caseId]/files/[fileId]/route')

    const req = new Request('http://localhost/api/case/123/files/abc', { method: 'DELETE' }) as any
    const params = Promise.resolve({ caseId: '123', fileId: 'abc' })

    const res = await DELETE(req, { params } as any)

    expect(apiFetch).toHaveBeenCalledWith('/case/123/files/abc', { method: 'DELETE' })

    expect(res).toBeInstanceOf(Response)
    expect(res.status).toBe(serverStatus)
    expect(res.headers.get('content-type')).toContain('application/json')

    const json = await (res as Response).json()
    expect(json).toEqual(payload)
  })

  it('returns plain text (and preserves Content-Type) when response is not JSON', async () => {
    const serverStatus = 200
    const bodyText = 'DELETED'
    const headers = new Headers({ 'content-type': 'text/plain' })

    ;(apiFetch as unknown as vi.Mock).mockResolvedValueOnce({
      status: serverStatus,
      headers,
      text: async () => bodyText,
    })

    const { DELETE } = await import('@/app/api/case/[caseId]/files/[fileId]/route')

    const req = new Request('http://localhost/api/case/123/files/xyz', { method: 'DELETE' }) as any
    const params = Promise.resolve({ caseId: '123', fileId: 'xyz' })

    const res = await DELETE(req, { params } as any)

    expect(apiFetch).toHaveBeenCalledWith('/case/123/files/xyz', { method: 'DELETE' })

    expect(res).toBeInstanceOf(Response)
    expect(res.status).toBe(serverStatus)
    expect(res.headers.get('content-type')).toBe('text/plain')

    const text = await (res as Response).text()
    expect(text).toBe(bodyText)
  })

  it('returns empty body with text/plain when no content-type and empty body', async () => {
    const serverStatus = 204
    const headers = new Headers() // no content-type

    ;(apiFetch as unknown as vi.Mock).mockResolvedValueOnce({
      status: serverStatus,
      headers,
      text: async () => '',
    })

    const { DELETE } = await import('@/app/api/case/[caseId]/files/[fileId]/route')

    const req = new Request('http://localhost/api/case/777/files/empty', { method: 'DELETE' }) as any
    const params = Promise.resolve({ caseId: '777', fileId: 'empty' })

    const res = await DELETE(req, { params } as any)

    expect(apiFetch).toHaveBeenCalledWith('/case/777/files/empty', { method: 'DELETE' })

    expect(res).toBeInstanceOf(Response)
    expect(res.status).toBe(serverStatus)
    expect(res.headers.get('content-type')).toBe('text/plain')

    const text = await (res as Response).text()
    expect(text).toBe('')
  })

  it('returns 500 with JSON error when apiFetch throws', async () => {
    ;(apiFetch as unknown as vi.Mock).mockRejectedValueOnce(new Error('boom'))

    const { DELETE } = await import('@/app/api/case/[caseId]/files/[fileId]/route')

    const req = new Request('http://localhost/api/case/999/files/err', { method: 'DELETE' }) as any
    const params = Promise.resolve({ caseId: '999', fileId: 'err' })

    const res = await DELETE(req, { params } as any)

    expect(res).toBeInstanceOf(Response)
    expect(res.status).toBe(500)

    const json = await (res as Response).json()
    expect(json).toEqual({
      error: 'Failed to delete suspect',
      details: 'Error: boom',
    })
  })
})
