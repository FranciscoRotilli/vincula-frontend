'use client';

import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { Tooltip } from '@mui/material';
import type { Node, Relationship } from '@neo4j-nvl/base';
import type NVL from '@neo4j-nvl/base';
import React, { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { CaseContainer } from '@/components/CaseContainer';
import Filter, { FieldConfig, FilterValues } from '@/components/Filter';
import Graph from '@/components/Graph';
import { GraphAlerts } from '@/components/GraphAlerts';
import NodeModal from '@/components/NodeModal';
import { useCaseGraph } from '@/hooks/useCase';
import { t } from '@/texts';

import styles from './page.module.css';
import {
  AppNode,
  AppRelationship,
  baseOptions,
  generateRelationshipName,
  getRelationshipSourceDatabase,
  transformApiData,
} from './utils';
export default function VinculosPage({ params }: { params: Promise<{ id: string }> }) {
  const nvlRef = useRef<NVL | null>(null);
  const { id } = use(params);

  const [graphNodes, setGraphNodes] = useState<AppNode[]>([]);
  const [graphRels, setGraphRels] = useState<AppRelationship[]>([]);
  const [filters, setFilters] = useState<FilterValues>({});
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [investigated, setInvestigated] = useState<{ value: string; label: string }[]>([]);
  const [file, setFile] = useState<{ value: string; label: string }[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedElement, setSelectedElement] = useState<AppNode | AppRelationship | null>(null);

  const isValidCpfCnpjLength = (value: string): boolean => {
    if (!value) return false;
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '');
    return cleaned.length === 11 || cleaned.length === 14;
  };

  const graphFilters = useMemo(() => {
    let cpfCnpjValue: string | undefined = undefined;

    if (filters.investigated) {
      cpfCnpjValue = String(filters.investigated);
    } else if (filters.cpfCnpj) {
      const cpfCnpjInput = String(filters.cpfCnpj);
      if (isValidCpfCnpjLength(cpfCnpjInput)) {
        cpfCnpjValue = cpfCnpjInput;
      }
    }

    return {
      cpf_cnpj: cpfCnpjValue,
      investigated: filters.nome ? String(filters.nome) : undefined,
      origin: filters.baseDados ? String(filters.baseDados) : undefined,
      file: filters.arquivo ? String(filters.arquivo) : undefined,
    };
  }, [filters]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(graphFilters).some((value) => value !== undefined && value !== '');
  }, [graphFilters]);

  const {
    data: graphData,
    isLoading: isLoadingGraph,
    error: graphError,
  } = useCaseGraph(id, graphFilters);

  useEffect(() => {
    if (graphData) {
      const { nodes, rels } = transformApiData(graphData);
      setGraphNodes(nodes);
      setGraphRels(rels);
    }
  }, [graphData]);

  const fitNodes = useCallback(() => {
    if (nvlRef.current && graphNodes.length > 0) {
      nvlRef.current.fit(graphNodes.map((n) => n.id));
    }
  }, [graphNodes]);

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
  }, [isFullscreen, fitNodes]);

  useEffect(() => {
    if (graphNodes.length > 0) {
      const timer = setTimeout(() => {
        fitNodes();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [graphNodes, fitNodes]);

  const handleNodeClick = (node: Node) => {
    setSelectedElement(node as AppNode);
  };

  const handleRelationshipClick = (rel: Relationship) => {
    setSelectedElement(rel as AppRelationship);
  };

  const handleCanvasClick = () => {
    setSelectedElement(null);
  };

  useEffect(() => {
    async function fetchCaseData() {
      try {
        const response = await fetch(`/api/case/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch case data');
        }
        const data = await response.json();

        const suspects = data.suspects || [];
        const options = [
          { value: '', label: 'Todos' },
          ...suspects.map((suspect: { name: string; cpf_cnpj: string }) => ({
            value: suspect.cpf_cnpj,
            label: `${suspect.name} - ${suspect.cpf_cnpj}`,
          })),
        ];
        setInvestigated(options);

        const caseFiles = data.files || [];
        const fileOptions = caseFiles.map((a: { name: string, id: string }) => ({
          value: a.id,
          label: a.name,
        }));
        setFile([{ value: '', label: 'Todos' }, ...fileOptions]);
      } catch (error) {
        toast.error(t('toastError.caseData'))
        console.error(error);
      }
    }
    fetchCaseData();
  }, [id]);

  const filterFields: FieldConfig[] = [
    {
      key: 'investigado',
      label: 'Investigado (CPF/CNPJ)',
      type: 'multi-select',
      options: investigated,
      placeholder: 'Selecione',
    },
    { key: 'nome', label: 'Nome', type: 'input', placeholder: 'Digite o nome' },
    { key: 'cpfCnpj', label: 'CPF/CNPJ', type: 'input', placeholder: 'Digite o CPF/CNPJ' },
    {
      key: 'baseDados',
      label: 'Base de dados',
      type: 'select',
      options: baseOptions,
      placeholder: 'Selecione',
    },
    {
      key: 'arquivo',
      label: 'Arquivo',
      type: 'multi-select',
      options: file,
      placeholder: 'Nome do arquivo',
    },
  ];

  const handleFilter = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  const handleClear = () => {
    setFilters({});
    setFilterValues({});
  };

  const validateFilterField = (key: string, value: string): string | undefined => {
    if (key === 'cpfCnpj' && value) {
      if (!isValidCpfCnpjLength(value)) {
        return ' ';
      }
    }
    return undefined;
  };

  return (
    <CaseContainer caseId={id}>
      {!isFullscreen && showFilters && (
        <Filter
          fields={filterFields}
          values={filterValues}
          onValuesChange={setFilterValues}
          onFilter={handleFilter}
          onClear={handleClear}
          autoFilter={true}
          debounceMs={2000}
          validateField={validateFilterField}
          customStyles={{
            container: styles.containerOverride,
          }}
        />
      )}

      <div className={isFullscreen ? styles.fullscreenContainer : ''} data-testid="graph-container">
        <div
          className={`${styles.graphContainer} ${!showFilters && !isFullscreen ? styles.graphContainerExpanded : ''}`}
        >
          {isFullscreen && showFilters && (
            <div className={styles.fullscreenFilters}>
              <Filter
                fields={filterFields}
                values={filterValues}
                onValuesChange={setFilterValues}
                onFilter={handleFilter}
                onClear={handleClear}
                autoFilter={true}
                debounceMs={2000}
                validateField={validateFilterField}
                customStyles={{
                  container: styles.containerOverride,
                }}
              />
            </div>
          )}

          <div className={styles.graphControls} data-testid="graph-controls">
            <Tooltip title={t('graph.zoomIn')} placement="right">
              <button onClick={zoomIn} className={styles.controlButton}>
                <ZoomInIcon />
              </button>
            </Tooltip>
            <Tooltip title={t('graph.zoomOut')} placement="right">
              <button onClick={zoomOut} className={styles.controlButton}>
                <ZoomOutIcon />
              </button>
            </Tooltip>
            <Tooltip title={t('graph.fitToScreen')} placement="right">
              <button onClick={fitNodes} className={styles.controlButton}>
                <FitScreenIcon />
              </button>
            </Tooltip>
            <Tooltip
              title={showFilters ? t('graph.hideFilters') : t('graph.showFilters')}
              placement="right"
            >
              <button onClick={() => setShowFilters(!showFilters)} className={styles.controlButton}>
                {showFilters ? <FilterListOffIcon /> : <FilterListIcon />}
              </button>
            </Tooltip>
            <Tooltip
              title={isFullscreen ? t('graph.exitFullscreen') : t('graph.fullscreen')}
              placement="right"
            >
              <button onClick={toggleFullscreen} className={styles.controlButton}>
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

          <GraphAlerts
            isLoading={isLoadingGraph}
            hasError={!!graphError}
            errorMessage={graphError instanceof Error ? graphError.message : undefined}
            hasActiveFilters={hasActiveFilters}
            hasNodes={graphNodes.length > 0}
            caseId={id}
          />

          {selectedElement && (
            <div
              style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}
              data-testid="graph-details-modal"
            >
              <NodeModal
                isOpen={true}
                onClose={() => setSelectedElement(null)}
                name={
                  selectedElement
                    ? 'from' in selectedElement
                      ? generateRelationshipName(selectedElement, graphNodes)
                      : (selectedElement.properties?.name as string) ||
                        selectedElement.caption ||
                        'Nó'
                    : ''
                }
                quantity={
                  selectedElement && 'from' in selectedElement
                    ? (selectedElement?.properties?.quantity as number)
                    : undefined
                }
                cpfCnpj={(selectedElement?.properties?.identity as string) || ''}
                phone={selectedElement?.properties?.phone_number as string}
                isRelationship={'from' in selectedElement}
                sourceDatabase={
                  selectedElement && 'from' in selectedElement
                    ? getRelationshipSourceDatabase(selectedElement, graphNodes)
                    : undefined
                }
                caseNumber={
                  selectedElement ? (selectedElement.properties?.case_number as string) : undefined
                }
                files={
                  selectedElement && 'from' in selectedElement
                    ? (() => {
                        const fileNames = selectedElement.properties?.file_name;
                        if (Array.isArray(fileNames)) {
                          return fileNames;
                        } else if (typeof fileNames === 'string') {
                          return [fileNames];
                        }
                        return undefined;
                      })()
                    : selectedElement &&
                        !('from' in selectedElement) &&
                        selectedElement.properties?.type !== 'Person'
                      ? (() => {
                          const fileNames = selectedElement.properties?.file_name;
                          if (Array.isArray(fileNames)) {
                            return fileNames;
                          } else if (typeof fileNames === 'string') {
                            return [fileNames];
                          }
                          return undefined;
                        })()
                      : undefined
                }
              />
            </div>
          )}
        </div>
      </div>
    </CaseContainer>
  );
}
