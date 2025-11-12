import { act,render, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest'

const interactiveWrapperMock = vi.fn((props: any) => {
  return <div data-testid="nvl-wrapper" />
})

vi.mock('@neo4j-nvl/react', () => ({
  InteractiveNvlWrapper: (props: any) => interactiveWrapperMock(props),
}))

type Node = { id: string; labels?: string[]; properties?: Record<string, any> }
type Relationship = {
  id: string
  source: string
  target: string
  type?: string
  properties?: Record<string, any>
}

import Graph from '@/components/Graph'

function lastWrapperProps() {
  const calls = interactiveWrapperMock.mock.calls
  if (!calls.length) throw new Error('InteractiveNvlWrapper was not called')
  return calls[calls.length - 1][0] 
}

describe('Graph component', () => {
  beforeEach(() => {
    vi.useRealTimers()
    interactiveWrapperMock.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllTimers()
  })

  it('renders with "webgl" renderer initially (no nodes)', () => {
    render(<Graph nodes={[]} rels={[]} />)
    const props = lastWrapperProps()
    expect(props.nvlOptions?.renderer).toBe('webgl')
  })

  it('uses onLayoutDone to switch renderer to "canvas" immediately', async () => {
    render(<Graph nodes={[{ id: '1' } as Node]} rels={[]} />)

    let props = lastWrapperProps()
    expect(props.nvlOptions?.renderer).toBe('webgl')

    await act(async () => {
      props.nvlCallbacks?.onLayoutDone?.()
    })

    await waitFor(() => {
      const p = lastWrapperProps()
      expect(p.nvlOptions?.renderer).toBe('canvas')
    })
  })

  it(
    'automatically switches to "canvas" after the fallback delay when there are nodes (timeout path, using real timers)',
    async () => {
      vi.useRealTimers()

      render(<Graph nodes={[{ id: 'n1' } as Node]} rels={[]} />)

      let props = lastWrapperProps()
      expect(props.nvlOptions?.renderer).toBe('webgl')

      const WAIT_MS = 2300
      await new Promise((r) => setTimeout(r, WAIT_MS))

      await waitFor(() => {
        const p = lastWrapperProps()
        expect(p.nvlOptions?.renderer).toBe('canvas')
      })
    },
    10000 
  )

  it('propagates mouseEventCallbacks (node, relationship, and canvas clicks)', () => {
    const onNodeClick = vi.fn()
    const onRelationshipClick = vi.fn()
    const onCanvasClick = vi.fn()

    render(
      <Graph
        nodes={[{ id: 'n1' } as Node]}
        rels={[{ id: 'r1', source: 'n1', target: 'n2' } as Relationship]}
        onNodeClick={onNodeClick}
        onRelationshipClick={onRelationshipClick}
        onCanvasClick={onCanvasClick}
      />
    )

    const props = lastWrapperProps()
    const mcb = props.mouseEventCallbacks

    expect(mcb).toBeTruthy()
    expect(mcb.onZoom).toBe(true)
    expect(mcb.onPan).toBe(true)
    expect(mcb.onDrag).toBe(true)
    expect(mcb.onHover).toBe(true)

    expect(mcb.onNodeClick).toBe(onNodeClick)
    expect(mcb.onRelationshipClick).toBe(onRelationshipClick)
    expect(mcb.onCanvasClick).toBe(onCanvasClick)
  })

  it('resets to "webgl" and layoutDone=false when the number of nodes/relationships changes', async () => {
    const { rerender } = render(<Graph nodes={[{ id: '1' } as Node]} rels={[]} />)

    let props = lastWrapperProps()
    await act(async () => {
      props.nvlCallbacks?.onLayoutDone?.()
    })
    await waitFor(() => {
      const p = lastWrapperProps()
      expect(p.nvlOptions?.renderer).toBe('canvas')
    })

    rerender(<Graph nodes={[{ id: '1' } as Node, { id: '2' } as Node]} rels={[]} />)

    await waitFor(() => {
      const p = lastWrapperProps()
      expect(p.nvlOptions?.renderer).toBe('webgl')
    })
  })

  it('passes the "zoom" prop to InteractiveNvlWrapper', () => {
    render(<Graph nodes={[{ id: '1' } as Node]} rels={[]} zoom={1.5} />)
    const props = lastWrapperProps()
    expect(props.zoom).toBe(1.5)
  })
})
