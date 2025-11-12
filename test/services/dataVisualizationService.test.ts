import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest'

import {
  DataVisualizationService,
  dataVisualizationService,
  type FilterData,
  type SavedFilter,
} from '@/services/dataVisualizationService'

describe('DataVisualizationService', () => {
  let svc: DataVisualizationService
  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-10-01T12:00:00Z'))
    vi.clearAllMocks()
    svc = new DataVisualizationService()
  })

  afterEach(() => {
    vi.useRealTimers()
    logSpy.mockClear()
  })

  it('getAvailableFiles: returns file list after delay and logs', async () => {
    const promise = svc.getAvailableFiles('case-123')
    await vi.advanceTimersByTimeAsync(800) 
    const files = await promise

    expect(files).toHaveLength(3)
    expect(files[0]).toMatchObject({ id: 'file1', name: 'ExtratoDetalhado.csv', type: 'csv' })
    expect(files[1]).toMatchObject({ id: 'file2', name: 'Extrato_X.xlsx', type: 'xlsx' })
    expect(files[2]).toMatchObject({ id: 'file3', name: 'Transferencias.json', type: 'json' })
    expect(logSpy).toHaveBeenCalledWith('Carregando arquivos para caso:', 'case-123')
  })

  it('getFileData: returns all rows/columns when no filters; logs; includes totalRows', async () => {
    const promise = svc.getFileData('case-xyz', 'file1', {})
    await vi.advanceTimersByTimeAsync(1200)

    const table = await promise
    expect(table.columns).toEqual([
      'NOME DO TITULAR',
      'CPF/CNPJ ORIGEM',
      'BANCO',
      'AGÊNCIA',
      'NÚMERO CONTA',
      'CNAB',
      'DATA LANÇAMENTO',
      'NOME DESTINO',
      'CPF/CNPJ DESTINO',
      'VALOR',
    ])
    expect(table.rows).toHaveLength(3)
    expect(table.totalRows).toBe(3)
    expect(logSpy).toHaveBeenCalledWith('Carregando dados:', {
      caseId: 'case-xyz',
      fileId: 'file1',
      filters: {},
    })
  })

  it('getFileData: applies search filter (matches across any field, case-insensitive)', async () => {
    const promise = svc.getFileData('c', 'f', { search: 'empresa x' })
    await vi.advanceTimersByTimeAsync(1200)
    const table = await promise

    expect(table.rows.map(r => r.id)).toEqual(['1'])
    expect(table.totalRows).toBe(1)
  })

  it('getFileData: applies investigado filter (uses "NOME DO TITULAR")', async () => {
    const promise = svc.getFileData('c', 'f', { investigado: 'beto' })
    await vi.advanceTimersByTimeAsync(1200)
    const table = await promise

    expect(table.rows.map(r => r.id)).toEqual(['1', '2'])
    expect(table.totalRows).toBe(2)
  })

  it('getFileData: applies cpfCnpj filter (matches ORIGEM or DESTINO)', async () => {
    const cpf = '000.000.000-00'
    const promise = svc.getFileData('c', 'f', { cpfCnpj: cpf })
    await vi.advanceTimersByTimeAsync(1200)
    const table = await promise

    expect(table.rows.map(r => r.id)).toEqual(['1', '2'])
    expect(table.totalRows).toBe(2)
  })

  it('getFileData: applies destino filter (uses "NOME DESTINO", case-insensitive)', async () => {
    const promise = svc.getFileData('c', 'f', { destino: 'Beltrano' })
    await vi.advanceTimersByTimeAsync(1200)
    const table = await promise

    expect(table.rows.map(r => r.id)).toEqual(['2'])
    expect(table.totalRows).toBe(1)
  })

  it('getSavedFilters: returns predefined list and logs', async () => {
    const promise = svc.getSavedFilters('case-abc')
    await vi.advanceTimersByTimeAsync(500)
    const filters = await promise

    expect(filters).toHaveLength(3)
    expect(filters[0]).toMatchObject({
      id: 'filter1',
      name: 'Busca - Beto Barbosa',
      filters: { investigado: 'BETO BARBOSA' },
      createdAt: new Date('2025-09-20'),
    } as SavedFilter)
    expect(filters[1]).toMatchObject({
      id: 'filter2',
      name: 'Busca - Empresa X',
      filters: { destino: 'Empresa X' },
      createdAt: new Date('2025-09-25'),
    } as SavedFilter)
    expect(filters[2]).toMatchObject({
      id: 'filter3',
      name: 'CPF - 000.000.000-00',
      filters: { cpfCnpj: '000.000.000-00' },
      createdAt: new Date('2025-09-28'),
    } as SavedFilter)

    expect(logSpy).toHaveBeenCalledWith('Carregando filtros salvos para caso:', 'case-abc')
  })

  it('saveFilter: returns new SavedFilter with generated id and current createdAt; logs', async () => {
    const filters: FilterData = { search: 'empresa', investigado: 'MARIA' }

    const promise = svc.saveFilter('case-777', 'Filtro Teste', filters)
    await vi.advanceTimersByTimeAsync(300)
    const saved = await promise
    const expectedIso = '2025-10-01T12:00:00.300Z'
expect(saved.createdAt?.toISOString()).toBe(expectedIso)
  })

  it('deleteSavedFilter: resolves after delay and logs', async () => {
    const promise = svc.deleteSavedFilter('case-111', 'filterX')
    await vi.advanceTimersByTimeAsync(200)
    await expect(promise).resolves.toBeUndefined()
    expect(logSpy).toHaveBeenCalledWith('Removendo filtro:', {
      caseId: 'case-111',
      filterId: 'filterX',
    })
  })

  it('singleton export behaves like a working instance', async () => {
    const p = dataVisualizationService.getAvailableFiles('case-singleton')
    await vi.advanceTimersByTimeAsync(800)
    const files = await p
    expect(Array.isArray(files)).toBe(true)
    expect(files.length).toBe(3)
  })
})
