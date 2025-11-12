import { describe, expect, it } from 'vitest'

import {
  type AppNode,
  type AppRelationship,
  baseOptions,
  calculateNodeSize,
  calculateWidth,
  generateRelationshipName,
  getRelationshipSourceDatabase,
  transformApiData,
} from '@/app/casos/[id]/vinculos/utils'

const rel = (over: Partial<AppRelationship> = {}): AppRelationship => ({
  id: over.id ?? 'r1',
  from: over.from ?? 'A',
  to: over.to ?? 'B',
  caption: over.caption ?? '',
  width: over.width ?? 1,
  properties: {
    ...(over.properties ?? {}),
  },
})

const node = (over: Partial<AppNode> = {}): AppNode => ({
  id: over.id ?? 'A',
  caption: over.caption ?? 'CAP',
  size: over.size ?? 30,
  color: over.color ?? '#000',
  properties: {
    ...(over.properties ?? {}),
  },
})

describe('baseOptions', () => {
  it('lista as bases conhecidas', () => {
    // Original utils exports: SIMBA, SITTEL, RIF (sem "Todos")
    expect(baseOptions).toEqual([
      { value: 'SIMBA', label: 'SIMBA' },
      { value: 'SITTEL', label: 'SITTEL' },
      { value: 'RIF', label: 'RIF' },
    ])
  })
})

describe('calculateWidth', () => {
  it('retorna 1 quando não há quantidades válidas ou quantity <= 0', () => {
    expect(calculateWidth(5, [])).toBe(1)
    expect(calculateWidth(0, [1, 2, 3])).toBe(1)
    expect(calculateWidth(-10, [1, 2, 3])).toBe(1)
    expect(calculateWidth(10, [0, -2])).toBe(1)
  })

  it('quando há apenas um valor válido em allQuantities, retorna 3 se quantity > 0', () => {
    expect(calculateWidth(1, [5])).toBe(3)
  })

  it('quando min === max, retorna 3', () => {
    expect(calculateWidth(7, [4, 4, 4])).toBe(3)
  })

  it('distribui em 5 faixas com normalização logarítmica (cobrindo todos os ramos)', () => {
    const min = 1
    const max = Math.E
    const all = [min, max]

    expect(calculateWidth(Math.exp(0.05), all)).toBe(1)
    expect(calculateWidth(Math.exp(0.2), all)).toBe(2)
    expect(calculateWidth(Math.exp(0.5), all)).toBe(3)
    expect(calculateWidth(Math.exp(0.8), all)).toBe(4)
    expect(calculateWidth(Math.exp(0.95), all)).toBe(5)
  })
})

describe('calculateNodeSize', () => {
  it('retorna tamanho padrão (30) quando não há quantidades, ou soma <= 0', () => {
    expect(calculateNodeSize([], 'X', [])).toBe(30)
    const relsZero = [rel({ from: 'X', properties: { quantity: 0 } })]
    expect(calculateNodeSize(relsZero, 'X', [0])).toBe(30)
  })

  it('com apenas um valor válido em allQuantities, retorna 2x quando soma > 0', () => {
    const rels = [
      rel({ from: 'X', properties: { quantity: 2 } }),
      rel({ from: 'X', properties: { quantity: 3 } }),
    ]

    expect(calculateNodeSize(rels, 'X', [10])).toBe(30 * 2)
  })

  it('quando min === max, retorna 1.5x', () => {
    const rels = [rel({ from: 'N', properties: { quantity: 2 } })]
    expect(calculateNodeSize(rels, 'N', [4, 4, 4])).toBe(30 * 1.5)
  })

  it('distribui em faixas com normalização logarítmica (cobrindo todos os ramos)', () => {
    const min = 1
    const max = Math.E
    const all = [min, max]

    const makeRels = (sum: number) => [rel({ from: 'Z', properties: { quantity: sum } })]

    expect(calculateNodeSize(makeRels(Math.exp(0.05)), 'Z', all)).toBe(30)
    expect(calculateNodeSize(makeRels(Math.exp(0.2)), 'Z', all)).toBeCloseTo(30 * 1.3, 6)
    expect(calculateNodeSize(makeRels(Math.exp(0.5)), 'Z', all)).toBeCloseTo(30 * 1.8, 6)
    expect(calculateNodeSize(makeRels(Math.exp(0.8)), 'Z', all)).toBeCloseTo(30 * 2, 6)
    expect(calculateNodeSize(makeRels(Math.exp(0.95)), 'Z', all)).toBeCloseTo(30 * 2.5, 6)
  })
})

describe('transformApiData', () => {
  it('transforma nós/arestas crus em AppNode/AppRelationship com joins e width calculado', () => {
    const apiData = {
      nodes: [
        {
          id: 'P1',
          name: 'João',
          identity: '123',
          case_number: '42',
          file_name: ['a.csv', 'b.csv'],
          phone_number: ['9999-0000', '8888-1111'],
          type: 'SIMBA',
        },
        {
          id: 'B1',
          type: 'SITTEL',
          file_name: 'x.csv',
          phone_number: '7777-2222',
        },
      ],
      edges: [
        {
          id: 'E1',
          source: 'P1',
          target: 'B1',
          quantity: 10,
          file_name: ['x.csv', 'y.csv'],
          rif_involvment: 'alta',
        },
        {
          id: 'E2',
          source: 'B1',
          target: 'P1',
          file_name: 'z.csv',
        },
      ],
    }

    const { nodes, rels } = transformApiData(apiData)

    expect(rels).toHaveLength(2)
    const r1 = rels[0]
    expect(r1).toMatchObject({
      id: 'E1',
      from: 'P1',
      to: 'B1',
      caption: '10',
      properties: {
        file_name: 'x.csv, y.csv',
        quantity: 10,
        rif_involvment: 'alta',
      },
    })
    expect(r1.width).toBeGreaterThanOrEqual(1)
    expect(r1.width).toBeLessThanOrEqual(5)

    const r2 = rels[1]
    expect(r2).toMatchObject({
      id: 'E2',
      from: 'B1',
      to: 'P1',
      caption: '',
      width: 1,
      properties: {
        file_name: 'z.csv',
        quantity: undefined,
        rif_involvment: undefined,
      },
    })

    expect(nodes).toHaveLength(2)
    const nP = nodes.find((n) => n.id === 'P1')!
    expect(nP.caption).toBe('João')
    expect(nP.color).toBe('#f0ad4e')
    expect(nP.size).toBeGreaterThan(30)
    expect(nP.properties).toMatchObject({
      identity: '123',
      case_number: '42',
      file_name: 'a.csv, b.csv',
      phone_number: '9999-0000, 8888-1111',
      type: 'SIMBA',
    })

    const nB = nodes.find((n) => n.id === 'B1')!
    expect(nB.caption).toBe('SITTEL')
    expect(nB.color).toBe('#007bff')
    expect(nB.size).toBe(40)
    expect(nB.properties).toMatchObject({
      identity: undefined,
      case_number: undefined,
      file_name: 'x.csv',
      phone_number: '7777-2222',
      type: 'SITTEL',
    })
  })
})

describe('generateRelationshipName', () => {
  it('usa o nome/caption do nó pessoa e o tipo do nó não-pessoa (pessoa no from)', () => {
    const graphNodes: AppNode[] = [
      node({ id: 'P', caption: 'CAP-P', properties: { identity: '1', name: 'Maria' } }),
      node({ id: 'X', caption: 'CAP-X', properties: { type: 'SIMBA' } }),
    ]
    const r = rel({ from: 'P', to: 'X', properties: { quantity: 7 } })

    expect(generateRelationshipName(r, graphNodes)).toBe('Maria → SIMBA (7)')
  })

  it('funciona também quando a pessoa está no "to"', () => {
    const graphNodes: AppNode[] = [
      node({ id: 'Y', caption: 'CAP-Y', properties: { type: 'SITTEL' } }),
      node({ id: 'P2', caption: 'FulanoCaption', properties: { identity: '2' } }),
    ]
    const r = rel({ from: 'Y', to: 'P2', properties: { quantity: 3 } })

    expect(generateRelationshipName(r, graphNodes)).toBe('FulanoCaption → SITTEL (3)')
  })
})

describe('getRelationshipSourceDatabase', () => {
  it('returns the type of non-person node (when from is not person)', () => {
    const graphNodes: AppNode[] = [
      node({ id: 'FROM', properties: { type: 'RIF' } }),
      node({ id: 'TO', properties: { identity: '1', name: 'Z' } }),
    ]
    const r = rel({ from: 'FROM', to: 'TO' })

    expect(getRelationshipSourceDatabase(r, graphNodes)).toBe('RIF')
  })

  it('returns the type of non-person node', () => {
    const graphNodes: AppNode[] = [
      node({ id: 'FROM', properties: { identity: '1', name: 'Z' } }),
      node({ id: 'TO', properties: { type: 'SIMBA' } }),
    ]
    const r = rel({ from: 'FROM', to: 'TO' })

    expect(getRelationshipSourceDatabase(r, graphNodes)).toBe('SIMBA')
  })

  it('returns "N/A" when both are person', () => {
    const graphNodes: AppNode[] = [
      node({ id: 'A', properties: { identity: '1' } }),
      node({ id: 'B', properties: { identity: '2' } }),
    ]
    const r = rel({ from: 'A', to: 'B' })

    expect(getRelationshipSourceDatabase(r, graphNodes)).toBe('N/A')
  })
})
