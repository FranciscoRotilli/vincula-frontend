import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from '@/app/api/user/route'

vi.mock('@/lib/backend', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/backend')>()
  return {
    ...actual,
    apiFetch: vi.fn(),
  }
})

import { apiFetch } from '@/lib/backend'

type MockResponse = {
  status: number
  text: () => Promise<string>
}

describe('API Route: /api/user GET', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  afterEach(() => {
    vi.resetModules()
  })

  it('calls apiFetch with correct URL and method', async () => {
    ;(apiFetch as unknown as vi.Mock).mockResolvedValue({
      status: 200,
      text: async () => JSON.stringify([{ id: '1', name: 'Ada' }]),
    } as MockResponse)

    const res = await GET()
    expect(apiFetch).toHaveBeenCalledWith('/user/', { method: 'GET' })
    expect(res.status).toBe(200)
  })

  it('parses and returns JSON when backend text is valid JSON', async () => {
    const payload = [{ id: '2', name: 'Grace' }]
    ;(apiFetch as unknown as vi.Mock).mockResolvedValue({
      status: 200,
      text: async () => JSON.stringify(payload),
    } as MockResponse)

    const res = await GET()
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/application\/json/i)
    const json = await res.json()
    expect(json).toEqual(payload)
  })

  it('returns text with application/json header when backend text is invalid JSON', async () => {
    ;(apiFetch as unknown as vi.Mock).mockResolvedValue({
      status: 502,
      text: async () => '{not: "json"',
    } as MockResponse)

    const res = await GET()
    expect(res.status).toBe(502)
    expect(res.headers.get('content-type')).toMatch(/application\/json/i)
    const body = await res.text()
    expect(body).toBe('{not: "json"')
  })
})
