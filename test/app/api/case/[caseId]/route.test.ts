import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DELETE,GET, PATCH } from '@/app/api/case/[caseId]/route'
import { apiFetch } from '@/lib/backend'

vi.mock('@/lib/backend', () => ({
  apiFetch: vi.fn(),
}))

describe('/api/case/[caseId]', () => {
  const mockApiFetch = vi.mocked(apiFetch)
  const mockRequest = {} as NextRequest
  const params = { params: Promise.resolve({ caseId: 'case-123' }) }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ---------------- GET ----------------
  describe('GET', () => {
    it('returns JSON response on success', async () => {
      const mockCaseData = { id: 'case-123', name: 'The Missing File' }
      mockApiFetch.mockResolvedValue(
        new Response(JSON.stringify(mockCaseData), { status: 200 })
      )

      const response = await GET(mockRequest, params)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toEqual(mockCaseData)
      expect(mockApiFetch).toHaveBeenCalledWith('/case/case-123', { method: 'GET' })
    })

    it('returns raw text and forces application/json header if body is not valid JSON', async () => {
      mockApiFetch.mockResolvedValue(
        new Response('An unexpected error occurred', {
          status: 500,
          headers: { 'content-type': 'text/plain' },
        })
      )

      const response = await GET(mockRequest, params)
      const text = await response.text()

      expect(response.status).toBe(500)
      expect(response.headers.get('content-type')).toBe('application/json')
      expect(text).toBe('An unexpected error occurred')
    })
  })

  // ---------------- PATCH ----------------
  describe('PATCH', () => {
    const updatePayload = { name: 'The Solved File' }

    it('returns updated JSON response on success', async () => {
      const patchRequest = new NextRequest('http://localhost/api/case/case-123', {
        method: 'PATCH',
        body: JSON.stringify(updatePayload),
      })

      const mockUpdatedCase = { id: 'case-123', ...updatePayload }
      mockApiFetch.mockResolvedValue(
        new Response(JSON.stringify(mockUpdatedCase), { status: 200 })
      )

      const response = await PATCH(patchRequest, params)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toEqual(mockUpdatedCase)
      expect(mockApiFetch).toHaveBeenCalledWith('/case/case-123', {
        method: 'PATCH',
        body: JSON.stringify(updatePayload),
      })
    })

    it('returns empty response with correct status when backend returns no body', async () => {
      const patchRequest = new NextRequest('http://localhost/api/case/case-123', {
        method: 'PATCH',
        body: JSON.stringify(updatePayload),
      })

      mockApiFetch.mockResolvedValue(new Response(null, { status: 204 }))

      const response = await PATCH(patchRequest, params)
      const text = await response.text()

      expect(response.status).toBe(204)
      expect(text).toBe('')
    })

    it('falls back to raw text and forces application/json when backend returns non-JSON text', async () => {
      const patchRequest = new NextRequest('http://localhost/api/case/case-123', {
        method: 'PATCH',
        body: JSON.stringify(updatePayload),
      })

      mockApiFetch.mockResolvedValue(
        new Response('invalid json payload', {
          status: 400,
          headers: { 'content-type': 'text/plain' },
        })
      )

      const response = await PATCH(patchRequest, params)
      const text = await response.text()

      expect(response.status).toBe(400)
      expect(response.headers.get('content-type')).toBe('application/json')
      expect(text).toBe('invalid json payload')
    })
  })

  // ---------------- DELETE ----------------
  describe('DELETE', () => {
    it('returns empty body with correct status when backend returns no content', async () => {
      mockApiFetch.mockResolvedValue(new Response(null, { status: 204 }))

      const response = await DELETE({} as any, params)
      const text = await response.text()

      expect(mockApiFetch).toHaveBeenCalledWith('/case/case-123', { method: 'DELETE' })
      expect(response.status).toBe(204)
      expect(text).toBe('')
    })
  })
})
