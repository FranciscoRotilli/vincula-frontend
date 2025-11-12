import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from '@/app/api/case/[caseId]/viewers/route'

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

describe('API Route: GET /api/case/[caseId]/viewers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('calls apiFetch with correct URL and method', async () => {
    ;(apiFetch as unknown as vi.Mock).mockResolvedValue({
      status: 200,
      text: async () => JSON.stringify([{ id: 'u1', name: 'Ada' }]),
    } as MockBackendResponse)

    const req = new NextRequest('http://localhost/api/case/C123/viewers')
    const res = await GET(req, { params: Promise.resolve({ caseId: 'C123' }) })

    expect(apiFetch).toHaveBeenCalledWith('/case/C123/viewers', { method: 'GET' })
    expect(res.status).toBe(200)
  })

  it('parses and returns JSON when backend text is valid JSON', async () => {
    const payload = [{ id: 'u2', name: 'Grace' }]
    ;(apiFetch as unknown as vi.Mock).mockResolvedValue({
      status: 200,
      text: async () => JSON.stringify(payload),
    } as MockBackendResponse)

    const req = new NextRequest('http://localhost/api/case/ZZ/viewers')
    const res = await GET(req, { params: Promise.resolve({ caseId: 'ZZ' }) })

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/application\/json/i)
    await expect(res.json()).resolves.toEqual(payload)
  })

  it('returns raw text with application/json header when backend text is invalid JSON', async () => {
    ;(apiFetch as unknown as vi.Mock).mockResolvedValue({
      status: 502,
      text: async () => '{bad: "json"',
    } as MockBackendResponse)

    const req = new NextRequest('http://localhost/api/case/BAD/viewers')
    const res = await GET(req, { params: Promise.resolve({ caseId: 'BAD' }) })

    expect(res.status).toBe(502)
    expect(res.headers.get('content-type')).toMatch(/application\/json/i)
    await expect(res.text()).resolves.toBe('{bad: "json"')
  })
})
