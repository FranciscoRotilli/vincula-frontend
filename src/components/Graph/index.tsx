"use client";
import type { HitTargets, Node, Relationship, Renderer } from '@neo4j-nvl/base'
import type { MouseEventCallbacks } from '@neo4j-nvl/react'
import { InteractiveNvlWrapper } from '@neo4j-nvl/react'
import React, { useState } from 'react'

interface InteractiveGraphProps {
  nodes: Node[];
  rels: Relationship[];
  height: number;
  zoom?: number;
  onNodeClick?: (node: Node, hitTargets: HitTargets, event: MouseEvent) => void;
  onRelationshipClick?: (rel: Relationship, hitTargets: HitTargets, event: MouseEvent) => void;
  onCanvasClick?: (event: MouseEvent) => void;
}
export default function Graph({
  nodes,
  rels,
  onNodeClick,
  onRelationshipClick,
  onCanvasClick,
}: InteractiveGraphProps) {
  const mouseEventCallbacks: MouseEventCallbacks = {
    onZoom: true,
    onPan: true,
    onDrag: true,
    onNodeClick: onNodeClick,
    onRelationshipClick: onRelationshipClick,
    onCanvasClick: onCanvasClick,
  }

  const [renderer, setRenderer] = useState<Renderer>("webgl")

  return (
    <>
      <div style={{ height: '100%', border: '1px solid black', position: 'relative' }}>
        <InteractiveNvlWrapper
          nodes={nodes}
          rels={rels}
          zoom={zoom}
          mouseEventCallbacks={mouseEventCallbacks}
          nvlOptions={{renderer}}
          nvlCallbacks={{
            onLayoutDone: () => {
              setRenderer('canvas')
            }
          }}
        />
      </div>
    </>
  )
}
