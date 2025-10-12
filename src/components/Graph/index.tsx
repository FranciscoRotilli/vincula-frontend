"use client";
import type { HitTargets, Node, Relationship, Renderer } from '@neo4j-nvl/base'
import type NVL from '@neo4j-nvl/base'
import type { MouseEventCallbacks } from '@neo4j-nvl/react'
import { InteractiveNvlWrapper } from '@neo4j-nvl/react'
import React, { forwardRef, useState } from 'react'

interface InteractiveGraphProps {
  nodes: Node[];
  rels: Relationship[];
  zoom?: number;
  onNodeClick?: (node: Node, hitTargets: HitTargets, event: MouseEvent) => void;
  onRelationshipClick?: (rel: Relationship, hitTargets: HitTargets, event: MouseEvent) => void;
  onCanvasClick?: (event: MouseEvent) => void;
}

const Graph = forwardRef<NVL, InteractiveGraphProps>(({
  nodes,
  rels,
  zoom,
  onNodeClick,
  onRelationshipClick,
  onCanvasClick,
}, ref) => {
  const [renderer, setRenderer] = useState<Renderer>("webgl");

  const mouseEventCallbacks: MouseEventCallbacks = {
    onZoom: true,
    onPan: true,
    onDrag: true,
    onNodeClick: onNodeClick,
    onRelationshipClick: onRelationshipClick,
    onCanvasClick: onCanvasClick,
    onHover: true,
  };

  return (
    <>
      <div style={{ height: '100%', border: '1px solid black', position: 'relative' }}>
        <InteractiveNvlWrapper
          ref={ref}
          nodes={nodes}
          rels={rels}
          zoom={zoom}
          mouseEventCallbacks={mouseEventCallbacks}
          nvlOptions={{
            renderer,
            styling: {
              dropShadowColor: 'black'
            }
          }}
          nvlCallbacks={{
            onLayoutDone: () => {
              setRenderer('canvas')
            }
          }}
        />
      </div>
    </>
  )
});

Graph.displayName = 'Graph';

export default Graph;