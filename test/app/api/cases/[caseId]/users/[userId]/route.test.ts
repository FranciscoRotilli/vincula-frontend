import type { NextRequest } from 'next/server'
import { beforeEach,describe, expect, it, vi } from 'vitest'

const apiFetchMock = vi.fn()
vi.mock('@/lib/backend', () => ({
  __esModule: true,
  apiFetch: (...args: any[]) => apiFetchMock(...args),
}))

import { DELETE } from '@/app/api/cases/[caseId]/users/[userId]/route'

function mkResp(ok: boolean, status: number, body?: any) {
  return Promise.resolve({
    ok,
    status,
    json: async () => body,
  } as unknown as Response)
}

describe('DELETE /api/cases/[caseId]/users/[userId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls apiFetch with correct URL + method and returns { success: true } on ok', async () => {
    const caseId = 'C-1'
    const userId = 'U-9'
    apiFetchMock.mockImplementation(() => mkResp(true, 200, { ok: true }))

    const req = {} as NextRequest
    const res = await DELETE(req, { params: Promise.resolve({ caseId, userId }) })

    expect(apiFetchMock).toHaveBeenCalledWith(`/cases/${caseId}/users/${userId}`, {
      method: 'DELETE',
    })

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ success: true })
  })

  it('returns translated error JSON and propagates status when backend is not ok', async () => {
    apiFetchMock.mockImplementation(() => mkResp(false, 403))

    const req = {} as NextRequest
    const res = await DELETE(req, { params: Promise.resolve({ caseId: 'C-x', userId: 'U-x' }) })

    expect(res.status).toBe(403)
    await expect(res.json()).resolves.toEqual({
      message: 'Falha ao remover acesso do usuário',
    })
  })
})
