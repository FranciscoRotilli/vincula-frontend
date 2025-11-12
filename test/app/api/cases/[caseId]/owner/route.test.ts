import type { NextRequest } from 'next/server'
import { beforeEach,describe, expect, it, vi } from 'vitest'

const apiFetchMock = vi.fn()
vi.mock('@/lib/backend', () => ({
  __esModule: true,
  apiFetch: (...args: any[]) => apiFetchMock(...args),
}))

import { PATCH } from '@/app/api/cases/[caseId]/owner/route'

function mkResp(status: number, textBody: string) {
  return Promise.resolve({
    status,
    text: async () => textBody,
  } as unknown as Response)
}

describe('PATCH /api/cases/[caseId]/owner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls backend with JSON body and returns parsed JSON with same status', async () => {
    const caseId = 'C-123'
    const body = { ownerId: 'U-9' }
    apiFetchMock.mockImplementation(() => mkResp(200, JSON.stringify({ ok: true })))

    const req = { json: vi.fn().mockResolvedValue(body) } as unknown as NextRequest
    const res = await PATCH(req, { params: Promise.resolve({ caseId }) })

    expect(apiFetchMock).toHaveBeenCalledWith(`/case/${caseId}/owner`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/application\/json/i)
    await expect(res.json()).resolves.toEqual({ ok: true })
  })

  it('returns empty body when backend returns empty text', async () => {
    apiFetchMock.mockImplementation(() => mkResp(204, ''))
    const req = { json: vi.fn().mockResolvedValue({}) } as unknown as NextRequest

    const res = await PATCH(req, { params: Promise.resolve({ caseId: 'C-empty' }) })
    expect(res.status).toBe(204)
    await expect(res.text()).resolves.toBe('')
  })

  it('returns raw text with application/json when backend sends invalid JSON', async () => {
    apiFetchMock.mockImplementation(() => mkResp(502, 'not-json'))
    const req = { json: vi.fn().mockResolvedValue({}) } as unknown as NextRequest

    const res = await PATCH(req, { params: Promise.resolve({ caseId: 'C-bad' }) })
    expect(res.status).toBe(502)
    expect(res.headers.get('content-type')).toMatch(/application\/json/i)
    await expect(res.text()).resolves.toBe('not-json')
  })

  it('stringifies the request body for backend', async () => {
    const body = { a: 1 }
    apiFetchMock.mockImplementation(() => mkResp(200, '{"ok":true}'))
    const req = { json: vi.fn().mockResolvedValue(body) } as unknown as NextRequest

    await PATCH(req, { params: Promise.resolve({ caseId: 'C-verify' }) })
    const [, init] = apiFetchMock.mock.calls[0] as [string, { body: string }]
    expect(init.body).toBe(JSON.stringify(body))
  })
})
