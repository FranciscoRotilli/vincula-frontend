"use client";
import type { Node, Relationship } from '@neo4j-nvl/base'
import type { MouseEventCallbacks } from '@neo4j-nvl/react'
import { InteractiveNvlWrapper } from '@neo4j-nvl/react'
import React from 'react'

interface InteractiveGraphProps {
  nodes: Node[];
  rels: Relationship[];
}

export default function Graph({ nodes, rels }: InteractiveGraphProps) {
  const mouseEventCallbacks: MouseEventCallbacks = {
    
  }

  return (
    <>
      <div style={{ height: 600, border: '1px solid black', position: 'relative' }}>
        <InteractiveNvlWrapper
          nodes={nodes}
          rels={rels}
          mouseEventCallbacks={mouseEventCallbacks}
        />
      </div>
    </>
  )
}
