import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/backend', () => ({
  apiFetch: vi.fn(),
}))
const { apiFetch } = await import('@/lib/backend')

describe('API /case/addtocase/[caseId] PATCH route', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls apiFetch with correct args and returns parsed JSON with same status', async () => {
    const payload = { items: ['A', 'B'] }
    const serverStatus = 200
    const serverJson = { ok: true, added: 2 }

    ;(apiFetch as unknown as vi.Mock).mockResolvedValueOnce(
      new Response(JSON.stringify(serverJson), { status: serverStatus })
    )

    const { PATCH } = await import('@/app/api/case/addtocase/[caseId]/route')

    const req = new Request('http://localhost/api/case/addtocase/case-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }) as any
    const params = { params: Promise.resolve({ caseId: 'case-1' }) }

    const res = await PATCH(req, params as any)

    expect(apiFetch).toHaveBeenCalledTimes(1)
    expect(apiFetch).toHaveBeenCalledWith('/case/addtocase/case-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    expect(res).toBeInstanceOf(Response)
    expect(res.status).toBe(serverStatus)
    const json = await (res as Response).json()
    expect(json).toEqual(serverJson)
  })

  it('returns empty body with correct status when backend returns no body', async () => {
    ;(apiFetch as unknown as vi.Mock).mockResolvedValueOnce(
      new Response(null, { status: 204 })
    )

    const { PATCH } = await import('@/app/api/case/addtocase/[caseId]/route')

    const req = new Request('http://localhost/api/case/addtocase/case-2', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [] }),
    }) as any
    const params = { params: Promise.resolve({ caseId: 'case-2' }) }

    const res = await PATCH(req, params as any)

    expect(res).toBeInstanceOf(Response)
    expect(res.status).toBe(204)
    expect(await (res as Response).text()).toBe('')
  })

  it('falls back to raw text and forces application/json when backend returns non-JSON text', async () => {
    const serverStatus = 400
    const bodyText = 'invalid payload'

    ;(apiFetch as unknown as vi.Mock).mockResolvedValueOnce(
      new Response(bodyText, {
        status: serverStatus,
        headers: { 'content-type': 'text/plain' },
      })
    )

    const { PATCH } = await import('@/app/api/case/addtocase/[caseId]/route')

    const req = new Request('http://localhost/api/case/addtocase/case-3', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: ['X'] }),
    }) as any
    const params = { params: Promise.resolve({ caseId: 'case-3' }) }

    const res = await PATCH(req, params as any)

    expect(res).toBeInstanceOf(Response)
    expect(res.status).toBe(serverStatus)
    expect(res.headers.get('content-type')).toBe('application/json')
    expect(await (res as Response).text()).toBe(bodyText)
  })

  it('propagates the error if apiFetch throws', async () => {
    ;(apiFetch as unknown as vi.Mock).mockRejectedValueOnce(new Error('network failure'))

    const { PATCH } = await import('@/app/api/case/addtocase/[caseId]/route')

    const req = new Request('http://localhost/api/case/addtocase/case-err', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: ['Y'] }),
    }) as any
    const params = { params: Promise.resolve({ caseId: 'case-err' }) }

    await expect(PATCH(req, params as any)).rejects.toThrow('network failure')
    expect(apiFetch).toHaveBeenCalledWith('/case/addtocase/case-err', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: ['Y'] }),
    })
  })
})
