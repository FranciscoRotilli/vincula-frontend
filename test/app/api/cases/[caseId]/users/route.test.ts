import type { NextRequest } from 'next/server'
import { beforeEach,describe, expect, it, vi } from 'vitest'

const apiFetchMock = vi.fn()
vi.mock('@/lib/backend', () => ({
  __esModule: true,
  apiFetch: (...args: any[]) => apiFetchMock(...args),
}))

import { GET } from '@/app/api/cases/[caseId]/users/route'

function mkResp(ok: boolean, status: number, body?: any) {
  return Promise.resolve({
    ok,
    status,
    json: async () => body,
  } as unknown as Response)
}

describe('GET /api/cases/[caseId]/users', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls apiFetch with correct path and returns JSON when ok', async () => {
    const caseId = 'C-123'
    const users = [{ id: 'U-1', name: 'Alice' }]
    apiFetchMock.mockImplementation(() => mkResp(true, 200, users))

    const req = {} as NextRequest
    const res = await GET(req, { params: Promise.resolve({ caseId }) })

    expect(apiFetchMock).toHaveBeenCalledWith(`/cases/${caseId}/users`)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual(users)
  })

  it('returns error JSON when response.ok is false', async () => {
    apiFetchMock.mockImplementation(() => mkResp(false, 404))

    const req = {} as NextRequest
    const res = await GET(req, { params: Promise.resolve({ caseId: 'nope' }) })

    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json).toEqual({ message: 'Falha ao buscar usuários com acesso' })
  })

  it('passes through backend status correctly', async () => {
    apiFetchMock.mockImplementation(() => mkResp(false, 500))
    const req = {} as NextRequest

    const res = await GET(req, { params: Promise.resolve({ caseId: 'C-err' }) })
    expect(res.status).toBe(500)
  })
})
