import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/backend', () => ({
  apiFetchFormData: vi.fn(),
}))
const { apiFetchFormData } = await import('@/lib/backend')

describe('API /case/[caseId]/files POST route', () => {
  beforeEach(() => {
    vi.resetModules() 
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls apiFetchFormData with ("/case/{id}/files", req, "POST") and propagates status/headers/body', async () => {
    const mockBody = 'FILE_OK'
    const mockHeaders = new Headers({
      'content-type': 'application/octet-stream',
      'x-custom': 'abc',
    })
    ;(apiFetchFormData as unknown as vi.Mock).mockResolvedValueOnce({
      status: 201,
      headers: mockHeaders,
      body: mockBody,
    })

    const { POST } = await import('@/app/api/case/[caseId]/files/route')

    const req = new Request('http://localhost/api/case/123/files', {
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data; boundary=----vitest',
      },
      body: '----vitest\r\n...',
    }) as any

    const params = Promise.resolve({ caseId: '123' })

    const res = await POST(req, { params } as any)

    expect(apiFetchFormData).toHaveBeenCalledTimes(1)
    expect(apiFetchFormData).toHaveBeenCalledWith('/case/123/files', expect.anything(), 'POST')

    expect(res).toBeInstanceOf(Response)
    expect(res.status).toBe(201)
    expect(res.headers.get('content-type')).toBe('application/octet-stream')
    expect(res.headers.get('x-custom')).toBe('abc')
    expect(await (res as Response).text()).toBe(mockBody)
  })

  it('propagates the error if apiFetchFormData rejects', async () => {
    ;(apiFetchFormData as unknown as vi.Mock).mockRejectedValueOnce(new Error('upload failed'))

    const { POST } = await import('@/app/api/case/[caseId]/files/route')

    const req = new Request('http://localhost/api/case/999/files', { method: 'POST' }) as any
    const params = Promise.resolve({ caseId: '999' })

    await expect(POST(req, { params } as any)).rejects.toThrow('upload failed')
    expect(apiFetchFormData).toHaveBeenCalledWith('/case/999/files', expect.anything(), 'POST')
  })
})
