"use client";
import type { HitTargets, Node, Relationship } from '@neo4j-nvl/base'
import type { MouseEventCallbacks } from '@neo4j-nvl/react'
import { InteractiveNvlWrapper } from '@neo4j-nvl/react'
import React, { useRef } from 'react'

interface InteractiveGraphProps {
  nodes: Node[];
  rels: Relationship[];
}

export default function Graph({ nodes, rels }: InteractiveGraphProps) {
  const eventLogRef = useRef<HTMLDivElement>(null)

  const logEvent = (
    nvlEventName: string,
    nvlEventData: {
      originalEvent: MouseEvent
      data?: Node | Relationship | Node[] | { x: number; y: number } | number
      hitTargets?: HitTargets
    }
  ) => {
    const { originalEvent, data, hitTargets } = nvlEventData
    console.log(nvlEventName, data, hitTargets, originalEvent)
    const eventLog = eventLogRef.current
    if (eventLog) {
      eventLog.innerHTML = `<strong>${nvlEventName}:</strong> ${JSON.stringify({ data, hitTargets }, null, 2)}`
    }
  }
  const mouseEventCallbacks: MouseEventCallbacks = {
    onHover: (element: Node | Relationship, hitTargets: HitTargets, originalEvent: MouseEvent) =>
      logEvent('onHover', { originalEvent, data: element, hitTargets }),
    onRelationshipRightClick: (
      rel: Relationship,
      hitTargets: HitTargets,
      originalEvent: MouseEvent
    ) =>
      logEvent('onRelationshipRightClick', { originalEvent, data: rel, hitTargets }),
    onNodeClick: (node: Node, hitTargets: HitTargets, originalEvent: MouseEvent) =>
      logEvent('onNodeClick', { originalEvent, data: node, hitTargets }),
    onNodeRightClick: (node: Node, hitTargets: HitTargets, originalEvent: MouseEvent) =>
      logEvent('onNodeRightClick', { originalEvent, data: node, hitTargets }),
    onNodeDoubleClick: (node: Node, hitTargets: HitTargets, originalEvent: MouseEvent) =>
      logEvent('onNodeDoubleClick', { originalEvent, data: node, hitTargets }),
    onRelationshipClick: (rel: Relationship, hitTargets: HitTargets, originalEvent: MouseEvent) =>
      logEvent('onRelationshipClick', { originalEvent, data: rel, hitTargets }),
    onRelationshipDoubleClick: (
      rel: Relationship,
      hitTargets: HitTargets,
      originalEvent: MouseEvent
    ) =>
      logEvent('onRelationshipDoubleClick', { originalEvent, data: rel, hitTargets }),
    onCanvasClick: (originalEvent: MouseEvent) => logEvent('onCanvasClick', { originalEvent }),
    onCanvasDoubleClick: (originalEvent: MouseEvent) => logEvent('onCanvasDoubleClick', { originalEvent }),
    onCanvasRightClick: (originalEvent: MouseEvent) => logEvent('onCanvasRightClick', { originalEvent }),
    onDrag: (draggedNodes: Node[], originalEvent: MouseEvent) =>
      logEvent('onDrag', { originalEvent, data: draggedNodes }),
    onPan: (pan: { x: number; y: number }, originalEvent: MouseEvent) =>
      logEvent('onPan', { originalEvent, data: pan }),
    onZoom: (zoomLevel: number, originalEvent: MouseEvent) => logEvent('onZoom', { originalEvent, data: zoomLevel })
  }

  return (
    <>
      <div title="event-log" ref={eventLogRef} style={{ height: 200, overflowY: 'auto', border: '1px solid #ccc', padding: '5px', marginBottom: '10px' }}>
      </div>
      <div style={{ height: 600, border: '1px solid black', position: 'relative' }}>
        <InteractiveNvlWrapper
          nodes={nodes}
          rels={rels}
          mouseEventCallbacks={mouseEventCallbacks}
        //   nvlOptions={{renderer: 'webgl', }}

        />
      </div>
    </>
  )
}
