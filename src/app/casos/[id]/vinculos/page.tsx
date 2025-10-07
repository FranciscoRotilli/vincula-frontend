'use client';

import type { Node, Relationship } from '@neo4j-nvl/base';
import type NVL from '@neo4j-nvl/base';
import React, { use, useEffect, useRef, useState } from 'react';
import { CircularProgress } from '@mui/material';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Tooltip } from '@mui/material';

import { CaseContainer } from '@/components/CaseContainer';
import Filter, { FieldConfig, FilterValues } from '@/components/Filter';
import Graph from '@/components/Graph';
import NodeModal from '@/components/NodeModal';
import { t } from '@/texts';

import { 
  AppNode, 
  AppRelationship, 
  baseOptions, 
  transformApiData,
  generateRelationshipName,
  getRelationshipSourceDatabase
} from './utils';
import { useCaseGraph } from '@/hooks/useCase';
import mockData from './MOCK_GRAFO.json';
import styles from './page.module.css';export default function VinculosPage({ params }: { params: Promise<{ id: string }> }) {
  const nvlRef = useRef<NVL | null>(null);
  const { id } = use(params);

  const [graphNodes, setGraphNodes] = useState<AppNode[]>([]);
  const [graphRels, setGraphRels] = useState<AppRelationship[]>([]);
  const [filters, setFilters] = useState<FilterValues>({});
  const [investigado, setInvestigado] = useState<{ value: string; label: string }[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<AppNode | AppRelationship | null>(null);

  const { data: graphData, isLoading: isLoadingGraph, error: graphError } = useCaseGraph(id);

  useEffect(() => {
    if (graphData) {
      console.log('Dados do grafo recebidos:', graphData); // DEBUG, remover
      const { nodes, rels } = transformApiData(graphData);
      setGraphNodes(nodes);
      setGraphRels(rels);
    } else if (graphError) {
      // MOCK, remover quando endpoint funcional
      console.warn('Erro ao carregar grafo, usando dados mock:', graphError);
      
      const { nodes: mockNodes, rels: mockRels } = transformApiData(mockData);
      setGraphNodes(mockNodes);
      setGraphRels(mockRels);
    }
  }, [graphData, graphError]);

  const fitNodes = () => {
    if (nvlRef.current && graphNodes.length > 0) {
      nvlRef.current.fit(graphNodes.map((n) => n.id));
    }
  };

  const resetZoom = () => {
    if (nvlRef.current) {
      nvlRef.current.resetZoom();
    }
  };

  const zoomIn = () => {
    if (nvlRef.current) {
      const currentScale = nvlRef.current.getScale();
      nvlRef.current.setZoom(currentScale * 1.2);
    }
  };

  const zoomOut = () => {
    if (nvlRef.current) {
      const currentScale = nvlRef.current.getScale();
      nvlRef.current.setZoom(currentScale * 0.8);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Erro ao alternar tela cheia:', error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      const wasFullscreen = isFullscreen;
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (isCurrentlyFullscreen !== wasFullscreen && nvlRef.current) {
        setTimeout(() => {
          fitNodes();
        }, 200);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fitNodes();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [graphNodes]);

  const handleNodeClick = (node: Node) => {
    console.log("Node selected: ", node);
    setSelectedElement(node as AppNode);
  }

  const handleRelationshipClick = (rel: Relationship) => {
    setSelectedElement(rel as AppRelationship);
  }

  const handleCanvasClick = () => {
    setSelectedElement(null);
  }

  useEffect(() => {
    async function fetchCaseData() {
      try {
        const response = await fetch(`/api/cases/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch case data');
        }
        const data = await response.json();
        
        const suspects = data.suspects || [];
        const suspectNames = suspects.map((suspect: { name: string }) => suspect.name);
        setInvestigated(suspectNames);

        const caseArchives = data.archives || [];
        const archiveNames = caseArchives.map((archive: { name: string }) => archive.name);
        setArchives(archiveNames);
      } catch (error) {
        console.error(error);
      }
    }
    fetchCaseData();
  }, [id]);

  return (
    <CaseContainer caseId={id}>
      <Filter
        fields={filterFields}
        onFilter={handleFilter}
        onClear={handleClear}
        customStyles={{
          container: styles.containerOverride,
        }}
      />
      
      <div className={isFullscreen ? styles.fullscreenContainer : ''}>
        <div className={styles.graphContainer}>
          <div className={styles.graphControls}>
            <Tooltip title={t('graph.zoomIn')} placement="right">
              <button 
                onClick={zoomIn}
                className={styles.controlButton}
              >
                <ZoomInIcon />
              </button>
            </Tooltip>
            <Tooltip title={t('graph.zoomOut')} placement="right">
              <button 
                onClick={zoomOut}
                className={styles.controlButton}
              >
                <ZoomOutIcon />
              </button>
            </Tooltip>
            <Tooltip title={t('graph.fitToScreen')} placement="right">
              <button 
                onClick={fitNodes}
                className={styles.controlButton}
              >
                <FitScreenIcon />
              </button>
            </Tooltip>
            <Tooltip title={t('graph.resetZoom')} placement="right">
              <button 
                onClick={resetZoom}
                className={styles.controlButton}
              >
                <RestartAltIcon />
              </button>
            </Tooltip>
            <Tooltip title={isFullscreen ? t('graph.exitFullscreen') : t('graph.fullscreen')} placement="right">
              <button 
                onClick={toggleFullscreen}
                className={styles.controlButton}
              >
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </button>
            </Tooltip>
          </div>

          <Graph
            ref={nvlRef}
            nodes={graphNodes}
            rels={graphRels}
            onNodeClick={handleNodeClick}
            onRelationshipClick={handleRelationshipClick}
            onCanvasClick={handleCanvasClick}
          />

          {isLoadingGraph && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1001,
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '20px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}>
              <CircularProgress size={40} />
              <span>Carregando grafo...</span>
            </div>
          )}
        
          {selectedElement && (
            <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
              <NodeModal
                isOpen={true}
                onClose={() => setSelectedElement(null)}
                name={selectedElement ? 
                  ('from' in selectedElement ? 
                    generateRelationshipName(selectedElement, graphNodes) :
                    (selectedElement.properties?.name as string || selectedElement.caption || 'Nó')
                  ) : ''
                }
                quantity={selectedElement && 'from' in selectedElement ? 
                  (selectedElement?.properties?.quantity as number) : 
                  undefined
                }
                cpfCnpj={selectedElement?.properties?.identity as string || ''}
                phone={selectedElement?.properties?.phone_number as string}
                isRelationship={'from' in selectedElement}
                sourceDatabase={selectedElement && 'from' in selectedElement ? 
                  getRelationshipSourceDatabase(selectedElement, graphNodes) : undefined
                }
                caseNumber={selectedElement ? 
                  (selectedElement.properties?.case_number as string) : undefined
                }
                files={selectedElement && 'from' in selectedElement ? 
                  (() => {
                    const fileNames = selectedElement.properties?.file_name;
                    if (Array.isArray(fileNames)) {
                      return fileNames;
                    } else if (typeof fileNames === 'string') {
                      return [fileNames];
                    }
                    return undefined;
                  })() : 
                  (selectedElement && !('from' in selectedElement) && selectedElement.properties?.type !== 'Person' ?
                    (() => {
                      const fileNames = selectedElement.properties?.file_name;
                      if (Array.isArray(fileNames)) {
                        return fileNames;
                      } else if (typeof fileNames === 'string') {
                        return [fileNames];
                      }
                      return undefined;
                    })() : undefined
                  )
                }
              />
            </div>
          )}
        </div>
      </div>
    </CaseContainer>
  );
}
}