import { vi } from 'vitest'
vi.mock('@/services/caseService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/caseService')>()
  return { ...actual }
})

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  addCase,
  allowUserToViewCase,
  deleteCase,
  getCaseById,
  getCaseGraph,
  getCases,
  updateCaseCanView,
  updateCaseName,
  updateCaseSituation,
} from '@/services/caseService'

type FetchCall = [RequestInfo, RequestInit?]

function okJson(data: any, init: Partial<Response> = {}) {
  return Promise.resolve({
    ok: true,
    status: init.status ?? 200,
    json: async () => data,
  } as Response)
}
function notOkJson(status: number, payload: any) {
  return Promise.resolve({
    ok: false,
    status,
    json: async () => payload,
  } as Response)
}
function notOkNoJson(status: number) {
  return Promise.resolve({
    ok: false,
    status,
    json: async () => {
      throw new Error('bad json')
    },
  } as unknown as Response)
}
function okNoJson(status = 200) {
  return Promise.resolve({
    ok: true,
    status,
    json: async () => {
      throw new Error('no body')
    },
  } as unknown as Response)
}

describe('caseService', () => {
  const fetchMock = vi.fn<[], Promise<Response>>()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('addCase', () => {
    it('POSTs and returns body on success', async () => {
      const body = { caseName: 'Created' }
      fetchMock.mockImplementation(() => okJson(body))

      const res = await addCase('Created')
      expect(res).toEqual(body)

      const [url, init] = fetchMock.mock.calls[0] as FetchCall
      expect(url).toBe('/api/case')
      expect(init?.method).toBe('POST')
      expect(init?.headers).toMatchObject({ 'Content-Type': 'application/json' })
      expect(init?.body).toBe(JSON.stringify({ name: 'Created' }))
    })

    it('throws message from server when !ok and JSON has message', async () => {
      fetchMock.mockImplementation(() => notOkJson(400, { message: 'Falhou bonito' }))
      await expect(addCase('X')).rejects.toThrow('Falhou bonito')
    })

    it('throws fallback when !ok and JSON is invalid', async () => {
      fetchMock.mockImplementation(() => notOkNoJson(500))
      await expect(addCase('X')).rejects.toThrow('Falha ao criar caso (status 500)')
    })
  })

  describe('getCases', () => {
    it('GETs with merged query string and returns JSON', async () => {
      const data = { items: [{ id: 1 }], total: 1 }
      fetchMock.mockImplementation(() => okJson(data))

      const pagination = { page: 2, limit: 10 }
      const filters = { name: 'abc', owner: 'me', status: 'Em andamento' as const }
      const sorting = { sort_by: 'name' as const, sort_dir: 'asc' as const }

      const res = await getCases(pagination, filters, sorting)
      expect(res).toEqual(data)

      const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
      const qs = url.split('?')[1] ?? ''
      const params = new URLSearchParams(qs)

      expect(params.get('page')).toBe('2')
      expect(params.get('limit')).toBe('10')
      expect(params.get('name')).toBe('abc')
      expect(params.get('owner')).toBe('me')
      expect(params.get('status')).toBe('Em andamento')
      expect(params.get('sort_by')).toBe('name')
      expect(params.get('sort_dir')).toBe('asc')
    })

    it('throws translated fallback on non-ok with invalid JSON', async () => {
      fetchMock.mockImplementation(() => notOkNoJson(503))
      await expect(getCases({ page: 1, limit: 5 }, {}, {})).rejects.toThrow(
        'Falha ao listar casos (status 503)',
      )
    })
  })

  describe('getCaseById', () => {
    it('GETs by id', async () => {
      const data = { id: 'abc', name: 'Case X' }
      fetchMock.mockImplementation(() => okJson(data))
      const res = await getCaseById('abc')
      expect(res).toEqual(data)

      const [url, init] = fetchMock.mock.calls[0] as FetchCall
      expect(url).toBe('/api/case/abc')
      expect(init?.method).toBe('GET')
    })

    it('throws translated message on error', async () => {
      fetchMock.mockImplementation(() => notOkNoJson(404))
      await expect(getCaseById('nope')).rejects.toThrow('Falha ao buscar caso (status 404)')
    })
  })

  describe('updateCaseName', () => {
    it('PATCH and returns { data: Promise, name: status } per implementation', async () => {
      fetchMock.mockImplementation(() => okJson({ ok: true }, { status: 207 }))

      const res = await updateCaseName('id1', 'New Name')
      expect(res).toMatchObject({ name: 207 })
      expect(typeof (res as any).data?.then).toBe('function')

      const resolved = await (res as any).data
      expect(resolved).toEqual({ ok: true })

      const [url, init] = fetchMock.mock.calls[0] as FetchCall
      expect(url).toBe('/api/case/id1')
      expect(init?.method).toBe('PATCH')
      expect(init?.body).toBe(JSON.stringify({ name: 'New Name' }))
    })

    it('throws translated message on !ok', async () => {
      fetchMock.mockImplementation(() => notOkNoJson(400))
      await expect(updateCaseName('id1', 'X')).rejects.toThrow(
        'Falha ao atualizar nome do caso (status 400)',
      )
    })
  })

  describe('updateCaseSituation', () => {
    it('PATCH and returns awaited { data, status }', async () => {
      fetchMock.mockImplementation(() => okJson({ changed: 1 }, { status: 200 }))
      const res = await updateCaseSituation('id2', 'Encerrado')
      expect(res).toEqual({ data: { changed: 1 }, status: 200 })

      const [url, init] = fetchMock.mock.calls[0] as FetchCall
      expect(url).toBe('/api/case/id2')
      expect(init?.method).toBe('PATCH')
      expect(init?.body).toBe(JSON.stringify({ status: 'Encerrado' }))
    })

    it('fallbacks when json throws', async () => {
      fetchMock.mockImplementation(() => okNoJson(204))
      const res = await updateCaseSituation('id', 'Suspenso')
      expect(res).toEqual({ data: null, status: 204 })
    })

    it('throws translated on !ok', async () => {
      fetchMock.mockImplementation(() => notOkNoJson(500))
      await expect(updateCaseSituation('id', 'X')).rejects.toThrow(
        'Falha ao atualizar situação do caso (status 500)',
      )
    })
  })

  describe('updateCaseCanView', () => {
    it('PATCH and returns json', async () => {
      fetchMock.mockImplementation(() => okJson({ canView: true }))
      const res = await updateCaseCanView('id3', true)
      expect(res).toEqual({ canView: true })

      const [url, init] = fetchMock.mock.calls[0] as FetchCall
      expect(url).toBe('/api/case/id3')
      expect(init?.method).toBe('PATCH')
      expect(init?.body).toBe(JSON.stringify({ canView: true }))
    })

    it('throws translated on !ok', async () => {
      fetchMock.mockImplementation(() => notOkNoJson(403))
      await expect(updateCaseCanView('id3', false)).rejects.toThrow(
        'Falha ao atualizar visibilidade do caso (status 403)',
      )
    })
  })

  describe('deleteCase', () => {
    it('DELETE and returns parsed json', async () => {
      fetchMock.mockImplementation(() => okJson({ removed: 1 }))
      const res = await deleteCase('id4')
      expect(res).toEqual({ removed: 1 })

      const [url, init] = fetchMock.mock.calls[0] as FetchCall
      expect(url).toBe('/api/case/id4')
      expect(init?.method).toBe('DELETE')
    })

    it('DELETE and returns { ok: true } when json throws', async () => {
      fetchMock.mockImplementation(() => okNoJson(200))
      const res = await deleteCase('id4')
      expect(res).toEqual({ ok: true })
    })

    it('throws translated on !ok', async () => {
      fetchMock.mockImplementation(() => notOkNoJson(500))
      await expect(deleteCase('id4')).rejects.toThrow('Falha ao excluir caso (status 500)')
    })
  })

  describe('allowUserToViewCase', () => {
    it('early returns null when missing params', async () => {
      expect(await allowUserToViewCase('', 'u')).toBeNull()
      expect(await allowUserToViewCase('c', '')).toBeNull()
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('PATCH returns null on 204', async () => {
      fetchMock.mockImplementation(() =>
        Promise.resolve({ ok: true, status: 204, json: async () => ({}) } as Response),
      )
      const res = await allowUserToViewCase('c1', 'u1')
      expect(res).toBeNull()

      const [url, init] = fetchMock.mock.calls[0] as FetchCall
      expect(url).toBe('/api/case/addtocase/c1')
      expect(init?.method).toBe('PATCH')
      expect(init?.body).toBe(JSON.stringify({ user_id: 'u1' }))
    })

    it('PATCH returns body on non-204', async () => {
      fetchMock.mockImplementation(() => okJson({ ok: true }, { status: 200 }))
      const res = await allowUserToViewCase('c1', 'u1')
      expect(res).toEqual({ ok: true })
    })
  })

  describe('getCaseGraph', () => {
    it('GETs graph with empty filters (no qs)', async () => {
      const data = { nodes: [], relations: [] }
      fetchMock.mockImplementation(() => okJson(data))
      const res = await getCaseGraph('C123')
      expect(res).toEqual(data)

      const [url, init] = fetchMock.mock.calls[0] as FetchCall
      expect(url).toBe('/api/case/C123/graph')
      expect(init?.method).toBe('GET')
      expect(init?.headers).toMatchObject({ 'Content-Type': 'application/json' })
    })


    it('throws translated on !ok', async () => {
      fetchMock.mockImplementation(() => notOkNoJson(502))
      await expect(getCaseGraph('X')).rejects.toThrow(
        'Falha ao buscar dados do grafo (status 502)',
      )
    })
  })
})
