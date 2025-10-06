// src/components/QuadradoNode.tsx
import React from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';

// Este componente recebe 'data' como propriedade, que conterá o label
export function SquareIndex({ data }: NodeProps) {
  const style: React.CSSProperties = {
    background: '#e04141', // Cor do quadrado
    color: 'black',        // Cor do texto
    width: 100,            // Largura
    height: 100,           // Altura
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid #777',
  };

  return (
    <div style={style}>
      {/* Handle é o ponto de conexão para as arestas (rels) */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      {/* O label do nó que vem dos dados */}
      <div>{data.label}</div>
    </div>
  );
}