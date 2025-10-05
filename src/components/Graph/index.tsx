"use client";
import type { HitTargets, Node, Relationship } from '@neo4j-nvl/base'
import type { MouseEventCallbacks } from '@neo4j-nvl/react'
import { InteractiveNvlWrapper } from '@neo4j-nvl/react'
import React from 'react'

interface InteractiveGraphProps {
  nodes: Node[];
  rels: Relationship[];
  height: number;
  onNodeClick?: (node: Node, hitTargets: HitTargets, event: MouseEvent) => void;
  onRelationshipClick?: (rel: Relationship, hitTargets: HitTargets, event: MouseEvent) => void;
  onCanvasClick?: (event: MouseEvent) => void;
}

export default function Graph({
  nodes,
  rels,
  height,
  onNodeClick,
  onRelationshipClick,
  onCanvasClick 
}: InteractiveGraphProps) {
  const mouseEventCallbacks: MouseEventCallbacks = {
    onZoom: true,
    onPan: true,
    onDrag: true,
    onNodeClick: onNodeClick,
    onRelationshipClick: onRelationshipClick,
    onCanvasClick: onCanvasClick,
  }

  return (
    <>
      <div style={{ height, border: '1px solid black', position: 'relative' }}>
        <InteractiveNvlWrapper
          nodes={nodes}
          rels={rels}
          mouseEventCallbacks={mouseEventCallbacks}
        />
      </div>
    </>
  )
}
