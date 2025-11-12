import { beforeEach, describe, expect, it, vi } from 'vitest'

import { addFile, removeFile } from '../../src/services/fileService'
import type { FileRequest } from '../../src/types/Files'

vi.stubGlobal('fetch', vi.fn())

describe('fileService', () => {
  const caseId = 'case-123'
  const fileId = 'file-456'
  const accessToken = 'test-bearer-token'

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('access_token', accessToken)
  })

  describe('removeFile', () => {
    it('calls DELETE with correct URL and headers; returns parsed JSON when ok', async () => {
      const json = vi.fn().mockResolvedValue({ removed: true })
      ;(fetch as unknown as vi.Mock).mockResolvedValue({ ok: true, json })

      const res = await removeFile(caseId, fileId)

      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenCalledWith(`/api/case/${caseId}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      })
      expect(json).toHaveBeenCalledTimes(1)
      expect(res).toEqual({ removed: true })
    })

    it('throws with statusText when response not ok', async () => {
      ;(fetch as unknown as vi.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
      })

      await expect(removeFile(caseId, fileId)).rejects.toThrow(
        'Falha ao remover arquivo: Bad Request'
      )
    })

    it('returns { ok: true } when ok but response has no JSON body', async () => {
      const json = vi.fn().mockRejectedValue(new Error('no json'))
      ;(fetch as unknown as vi.Mock).mockResolvedValue({ ok: true, json })

      const res = await removeFile(caseId, fileId)
      expect(res).toEqual({ ok: true })
      expect(json).toHaveBeenCalledTimes(1)
    })
  })

  describe('addFile', () => {
    function makeFile(name = 'test.txt', content = 'hello', type = 'text/plain') {
      try {
        return new File([content], name, { type })
      } catch {
        const blob = new Blob([content], { type }) as any
        blob.name = name
        return blob
      }
    }

    it('POSTs FormData with origin, file_type, file; returns parsed JSON when ok', async () => {
      const json = vi.fn().mockResolvedValue({ id: 'f1', stored: true })
      ;(fetch as unknown as vi.Mock).mockResolvedValue({ ok: true, json })

      const file = makeFile('extrato.csv', 'x,y,z', 'text/csv')
      const body: FileRequest = { origin: 'SIMBA', file_type: 'csv', file }

      const res = await addFile(caseId, body)

      expect(fetch).toHaveBeenCalledTimes(1)
      const [url, init] = (fetch as unknown as vi.Mock).mock.calls[0]
      expect(url).toBe(`/api/case/${caseId}/files`)
      expect(init.method).toBe('POST')

      expect(init.body).toBeInstanceOf(FormData)
      const fd = init.body as FormData
      expect(fd.get('origin')).toBe('SIMBA')
      expect(fd.get('file_type')).toBe('csv')

      const sentFile = fd.get('file') as File | Blob | null
      expect(sentFile).toBeTruthy()
      if (sentFile && 'name' in (sentFile as any)) {
        expect((sentFile as any).name).toBe('extrato.csv')
      }

      expect((init.headers ?? {})['Content-Type']).toBeUndefined()

      expect(json).toHaveBeenCalledTimes(1)
      expect(res).toEqual({ id: 'f1', stored: true })
    })

    it('throws with statusText when response not ok', async () => {
      ;(fetch as unknown as vi.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Unsupported Media Type',
      })

      const file = makeFile()
      await expect(
        addFile(caseId, { origin: 'RIF', file_type: 'json', file })
      ).rejects.toThrow('Falha ao adicionar arquivo: Unsupported Media Type')
    })

    it('returns { ok: true } when ok but response has no JSON body', async () => {
      const json = vi.fn().mockRejectedValue(new Error('no json'))
      ;(fetch as unknown as vi.Mock).mockResolvedValue({ ok: true, json })

      const file = makeFile('data.json', '{"a":1}', 'application/json')
      const res = await addFile(caseId, { origin: 'SITTEL', file_type: 'json', file })

      expect(res).toEqual({ ok: true })
      expect(json).toHaveBeenCalledTimes(1)
    })
  })
})
