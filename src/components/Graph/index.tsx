"use client";
import type { HitTargets, Node, Relationship, Renderer } from '@neo4j-nvl/base'
import type NVL from '@neo4j-nvl/base'
import type { MouseEventCallbacks } from '@neo4j-nvl/react'
import { InteractiveNvlWrapper } from '@neo4j-nvl/react'
import React, { forwardRef, useMemo,useState } from 'react'

interface InteractiveGraphProps {
  nodes: Node[];
  rels: Relationship[];
  zoom?: number;
  onNodeClick?: (node: Node, hitTargets: HitTargets, event: MouseEvent) => void;
  onRelationshipClick?: (rel: Relationship, hitTargets: HitTargets, event: MouseEvent) => void;
  onCanvasClick?: (event: MouseEvent) => void;
  onHover?: (element: Node | Relationship, hitElements: HitTargets, event: MouseEvent) => void;
}

const Graph = forwardRef<NVL, InteractiveGraphProps>(({
  nodes,
  rels,
  zoom,
  onNodeClick,
  onRelationshipClick,
  onCanvasClick,
  onHover,
}, ref) => {
  const [renderer, setRenderer] = useState<Renderer>("webgl");
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);

  const handleHover = (
    element: Node | Relationship,
    hitElements: HitTargets,
    event: MouseEvent
  ) => {
    setHoveredElementId(element.id);
    if (onHover) {
      onHover(element, hitElements, event);
    }
  };

  const handleCanvasClick = (event: MouseEvent) => {
    setHoveredElementId(null);
    if (onCanvasClick) {
      onCanvasClick(event);
    }
  };

  const mouseEventCallbacks: MouseEventCallbacks = {
    onZoom: true,
    onPan: true,
    onDrag: true,
    onNodeClick: onNodeClick,
    onRelationshipClick: onRelationshipClick,
    onCanvasClick: handleCanvasClick,
    onHover: handleHover,
  };

  const styledNodes = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      dropShadow: node.id === hoveredElementId,
    }));
  }, [nodes, hoveredElementId]);

  const styledRels = useMemo(() => {
    return rels.map(rel => ({
      ...rel,
      dropShadow: rel.id === hoveredElementId,
    }));
  }, [rels, hoveredElementId]);

  return (
    <>
      <div style={{ height: '100%', border: '1px solid black', position: 'relative' }}>
        <InteractiveNvlWrapper
          ref={ref}
          nodes={styledNodes}
          rels={styledRels}
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