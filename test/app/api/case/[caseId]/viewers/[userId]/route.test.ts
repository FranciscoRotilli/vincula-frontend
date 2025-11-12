import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DELETE } from '@/app/api/case/[caseId]/viewers/[userId]/route'

vi.mock('@/lib/backend', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/backend')>()
  return {
    ...actual,
    apiFetch: vi.fn(),
  }
})

import { apiFetch } from '@/lib/backend'

type MockBackendResponse = {
  status: number
  text: () => Promise<string>
}

describe('API Route: DELETE /api/case/[caseId]/viewers/[userId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  afterEach(() => {
    vi.resetModules()
  })

  it('calls apiFetch with correct URL and method', async () => {
    ;(apiFetch as unknown as vi.Mock).mockResolvedValue({
      status: 200,
      text: async () => JSON.stringify({ removed: true }),
    } as MockBackendResponse)

    const req = new NextRequest('http://localhost/api/case/C1/viewers/U1')
    const res = await DELETE(req, { params: Promise.resolve({ caseId: 'C1', userId: 'U1' }) })

    expect(apiFetch).toHaveBeenCalledWith('/case/C1/viewers/U1', { method: 'DELETE' })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ removed: true })
  })

  it('returns 204 no content when backend responds with 204', async () => {
    ;(apiFetch as unknown as vi.Mock).mockResolvedValue({
      status: 204,
      text: async () => '',
    } as MockBackendResponse)

    const req = new NextRequest('http://localhost/api/case/X/viewers/Y')
    const res = await DELETE(req, { params: Promise.resolve({ caseId: 'X', userId: 'Y' }) })

    expect(res.status).toBe(204)
    const text = await res.text()
    expect(text).toBe('')
    expect(res.headers.get('content-type')).toBeNull()
  })


  it('parses and returns JSON when backend returns valid JSON', async () => {
    const payload = { ok: true }
    ;(apiFetch as unknown as vi.Mock).mockResolvedValue({
      status: 200,
      text: async () => JSON.stringify(payload),
    } as MockBackendResponse)

    const req = new NextRequest('http://localhost/api/case/C2/viewers/U2')
    const res = await DELETE(req, { params: Promise.resolve({ caseId: 'C2', userId: 'U2' }) })

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/application\/json/i)
    const json = await res.json()
    expect(json).toEqual(payload)
  })

  it('returns raw text with JSON header when backend text is invalid JSON', async () => {
    ;(apiFetch as unknown as vi.Mock).mockResolvedValue({
      status: 502,
      text: async () => '{broken: true',
    } as MockBackendResponse)

    const req = new NextRequest('http://localhost/api/case/BAD/viewers/USER')
    const res = await DELETE(req, { params: Promise.resolve({ caseId: 'BAD', userId: 'USER' }) })

    expect(res.status).toBe(502)
    expect(res.headers.get('content-type')).toMatch(/application\/json/i)
    const body = await res.text()
    expect(body).toBe('{broken: true')
  })
})
