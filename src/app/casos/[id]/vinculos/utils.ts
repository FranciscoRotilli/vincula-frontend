import type { Node, Relationship } from '@neo4j-nvl/base';

export interface AppNode extends Node {
  properties: Record<string, unknown>;
}

export interface AppRelationship extends Relationship {
  properties: Record<string, unknown>;
}

export interface RawNode {
  id: string;
  name?: string;
  identity?: string;
  case_number?: string;
  file_name?: string | string[];
  phone_number?: string | string[];
  type: string;
}

export interface RawEdge {
  id: string;
  source: string;
  target: string;
  quantity?: number;
  file_name?: string | string[];
  rif_involvment?: string;
}

export const baseOptions = [
  { value: 'SIMBA', label: 'SIMBA' },
  { value: 'SINTEL', label: 'SINTEL' },
];

export const calculateWidth = (quantity: number, allQuantities: number[]) => {
  if (!allQuantities.length || quantity === undefined || quantity <= 0) return 1;

  const validQuantities = allQuantities.filter(q => q != null && q > 0).sort((a, b) => a - b);
  
  if (validQuantities.length === 0) return 1;
  if (validQuantities.length === 1) return quantity > 0 ? 3 : 1;
  
  const min = validQuantities[0];
  const max = validQuantities[validQuantities.length - 1];
  
  if (min === max) return 3;
  
  const logMin = Math.log(min);
  const logMax = Math.log(max);
  const logQuantity = Math.log(quantity);
  
  const normalized = (logQuantity - logMin) / (logMax - logMin);
  
  if (normalized <= 0.1) return 1;
  if (normalized <= 0.3) return 2;
  if (normalized <= 0.6) return 3;
  if (normalized <= 0.85) return 4;
  return 5;
};

export const transformApiData = (apiData: { nodes: RawNode[]; edges: RawEdge[] }) => {
  const allQuantities = apiData.edges.map(edge => edge.quantity).filter(q => q != null) as number[];
  
  const nodes: AppNode[] = apiData.nodes.map(rawNode => {
    return {
      id: rawNode.id,
      caption: rawNode.identity ? rawNode.name : rawNode.type,
      size: 30,
      color: rawNode.identity ? '#f0ad4e' : '#e04141',
      properties: {
        identity: rawNode.identity,
        case_number: rawNode.case_number,
        file_name: Array.isArray(rawNode.file_name) ? rawNode.file_name.join(', ') : rawNode.file_name,
        phone_number: Array.isArray(rawNode.phone_number) ? rawNode.phone_number.join(', ') : rawNode.phone_number,
        type: rawNode.type,
      },
    };
  });
  
  const rels: AppRelationship[] = apiData.edges.map(rawEdge => {
    return {
      id: rawEdge.id,
      from: rawEdge.source,
      to: rawEdge.target,
      caption: String(rawEdge.quantity || ''),
      width: rawEdge.quantity ? calculateWidth(rawEdge.quantity, allQuantities) : 1,
      properties: {
        file_name: Array.isArray(rawEdge.file_name) ? rawEdge.file_name.join(', ') : rawEdge.file_name,
        quantity: rawEdge.quantity,
        rif_involvment: rawEdge.rif_involvment,
      },
    };
  });
  
  return { nodes, rels };
};

export const generateRelationshipName = (
  selectedElement: AppRelationship,
  graphNodes: AppNode[]
): string => {
  const fromNode = graphNodes.find(node => node.id === selectedElement.from);
  const toNode = graphNodes.find(node => node.id === selectedElement.to);
  const quantity = selectedElement.properties?.quantity || 0;
  
  let personName = '';
  let nonPersonType = '';
  
  if (fromNode?.properties?.identity) {
    personName = fromNode.properties?.name as string || fromNode.caption || 'Fulano';
    nonPersonType = toNode?.properties?.type as string || 'Desconhecido';
  } else if (toNode?.properties?.identity) {
    personName = toNode.properties?.name as string || toNode.caption || 'Fulano';
    nonPersonType = fromNode?.properties?.type as string || 'Desconhecido';
  }
  
  return `${personName} → ${nonPersonType} (${quantity})`;
};

export const getRelationshipSourceDatabase = (
  selectedElement: AppRelationship,
  graphNodes: AppNode[]
): string => {
  const fromNode = graphNodes.find(node => node.id === selectedElement.from);
  const toNode = graphNodes.find(node => node.id === selectedElement.to);
  
  if (!fromNode?.properties?.identity) {
    return fromNode?.properties?.type as string;
  } else if (!toNode?.properties?.identity) {
    return toNode?.properties?.type as string;
  }
  return 'N/A';
};