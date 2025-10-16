'use client';

import { Alert, Button, CircularProgress, Paper } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import ButtonCerto from '@/components/Button';
import Filter, { FieldConfig, FilterValues } from '@/components/Filter';
import { t } from '@/texts';

import {
  AvailableFile,
  FileData,
  getAvailableFiles,
  getFileData,
} from '../../services/mock/visualizationService';
import GenericTable from '../GenericTable';
import styles from './VisualizationTab.module.css';

interface VisualizationTabProps {
  caseId: string;
}

type RowRecord = Record<string, unknown> & { id: string };

export const VisualizationTab = ({ caseId }: VisualizationTabProps) => {
  const [data, setData] = useState<FileData | null>(null);
  const [_dataError, setDataError] = useState<string | null>(null);
  const [files, setFiles] = useState<AvailableFile[]>([]);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<FileData | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedFile, setSelectedFile] = useState<AvailableFile | null>(null);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterValues>({
    investigado: '',
    cpfCnpj: '',
    destino: '',
  });

  const [investigado, setInvestigado] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    async function fetchSuspects() {
      try {
        const response = await fetch(`/api/case/${caseId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch suspects');
        }
        const data = await response.json();
        const suspects = data.suspects || [];
        const options = suspects.map((suspect: { name: string }) => ({
          value: suspect.name,
          label: `${suspect.name}`,
        }));
        setInvestigado(options);
      } catch (error) {
        console.error(error);
      }
    }
    fetchSuspects();
  }, [caseId]);

  useEffect(() => {
    setIsLoadingFiles(true);
    getAvailableFiles(caseId)
      .then((data) => setFiles(data))
      .catch((_err) => setFilesError(t('visualization.filesLoadError')))
      .finally(() => setIsLoadingFiles(false));
  }, [caseId]);

  const applyFilters = (appliedFilters: FilterValues) => {
    if (!data) return;
    let filtered = data.rows;

    const { investigado, cpfCnpj, destino } = appliedFilters;

    if (investigado?.trim()) {
      filtered = filtered.filter((row) =>
        String(row['NOME DO TITULAR'] || '')
          .toLowerCase()
          .includes(investigado.toLowerCase())
      );
    }

    if (cpfCnpj?.trim()) {
      filtered = filtered.filter(
        (row) =>
          String(row['CPF/CNPJ ORIGEM'] || '')
            .toLowerCase()
            .includes(cpfCnpj.toLowerCase()) ||
          String(row['CPF/CNPJ DESTINO'] || '')
            .toLowerCase()
            .includes(cpfCnpj.toLowerCase())
      );
    }

    if (destino?.trim()) {
      filtered = filtered.filter((row) =>
        String(row['NOME DESTINO'] || '')
          .toLowerCase()
          .includes(destino.toLowerCase())
      );
    }

    setFilteredData({ ...data, rows: filtered });
  };

  const handleFilter = (newFilters: FilterValues) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleClear = () => {
    setFilters({});
    if (data) setFilteredData(data);
  };

  const handleFileClick = (file: AvailableFile) => {
    if (selectedFile?.id === file.id) return;

    setSelectedFile(file);
    setLoadingFileId(file.id);
    setIsLoadingData(true);
    setData(null);
    setFilteredData(null);
    setDataError(null);

    getFileData(caseId, file.id)
      .then((fileData) => {
        setData(fileData);
        setFilteredData(fileData);
      })
      .catch((_err) => setDataError(t('visualization.dataLoadError')))
      .finally(() => {
        setIsLoadingData(false);
        setLoadingFileId(null);
      });
  };

  const renderFileChips = () => {
    if (isLoadingFiles) return <CircularProgress size={24} />;
    if (filesError) return <Alert severity="error">{filesError}</Alert>;
    if (files.length === 0) return <div>{t('visualization.noFiles')}</div>;

    return (
      <div className={styles.chipsContainer}>
        {files.map((file) => {
          const isLoading = loadingFileId === file.id;
          return (
            <ButtonCerto
              key={file.id}
              label={file.name}
              onClick={() => handleFileClick(file)}
              disabled={isLoading}
              variant="contained"
              data-testid={`file-chip-${file.id}`}
            />
          );
        })}
      </div>
    );
  };

  // 🔁 Mapeia colunas (strings) para o formato do GenericTable
  const gtColumns = useMemo(() => {
    const source = filteredData ?? data;
    if (!source) return [];
    return source.columns.map((col) => ({
      key: col as keyof RowRecord, // o GenericTable tipa com keyof T
      label: col,
      align: 'left' as const,
    }));
  }, [filteredData, data]);

  // 🔁 Converte rows para incluir `id` obrigatório
  const gtRows = useMemo<RowRecord[]>(() => {
    const source = filteredData ?? data;
    if (!source) return [];
    return source.rows.map((row, idx) => ({
      id: `${selectedFile?.id ?? 'file'}-${idx}`,
      ...row,
    }));
  }, [filteredData, data, selectedFile?.id]);

  const hasFiltersApplied =
    (filters.investigado?.trim() ||
      filters.cpfCnpj?.trim() ||
      filters.destino?.trim()) ??
    false;

  const filterFields: FieldConfig[] = [
    {
      key: 'investigado',
      label: t('filter.label1'),
      type: 'select',
      options: investigado,
      placeholder: t('filter.placeholder1'),
    },
    {
      key: 'cpfCnpj',
      label: t('filter.label2'),
      type: 'input',
      placeholder: t('filter.placeholder2'),
    },
    {
      key: 'destino',
      label: t('filter.label3'),
      type: 'input',
      placeholder: t('filter.placeholder3'),
    },
  ];

  return (
    <div className={styles.tabContainer}>
      <div className={styles.gridContainer}>
        <Paper variant="outlined" className={styles.filters} data-testid="filters">
          <div className={styles.texts}>
            <h1 className={styles.title3}>{t('visualization.filters')}</h1>
            <p className={styles.body5} color="text.secondary">
              {t('visualization.filtersDesc')}
            </p>
          </div>
          <div className={styles.chipsContainer}>
            <ButtonCerto label="CPF - Beto Barbosa" onClick={() => {}} variant="contained" />
            <ButtonCerto label="CPF - Destino X" onClick={() => {}} variant="contained" />
          </div>
        </Paper>

        <Paper variant="outlined" className={styles.files} data-testid="files">
          <div className={styles.texts}>
            <h1 className={styles.title3}>
              {t('visualization.availableFiles', {
                count: isLoadingFiles ? t('visualization.loading') : files.length,
              })}
            </h1>
            <p className={styles.body5} color="text.secondary">
              {t('visualization.availableFilesDesc')}
            </p>
          </div>
          {renderFileChips()}
        </Paper>

        {selectedFile && (
          <Paper variant="outlined" className={styles.tableContainer}>
            <div className={styles.title3} style={{ padding: '1rem' }}>
              {selectedFile.name}
            </div>

            <div className={styles.filterActionsRow}>
              <Filter
                fields={filterFields}
                onFilter={handleFilter}
                onClear={handleClear}
                onSaveFilter={(filters) => {
                  console.log('Filtro salvo:', filters);
                  alert('Filtro salvo com sucesso!');
                }}
                defaultValues={filters}
                customStyles={{
                  container: styles.tableFilters,
                  fieldsRow: styles.fieldsRow,
                  actions: styles.filterActions,
                }}
              />
            </div>

            {!isLoadingData && gtRows.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div>
                  {hasFiltersApplied
                    ? 'Nenhum resultado encontrado para os filtros aplicados.'
                    : t('visualization.noData')}
                </div>
                {hasFiltersApplied && (
                  <Button variant="text" onClick={handleClear} sx={{ mt: 1 }}>
                    {t('visualization.clearButton')}
                  </Button>
                )}
              </div>
            ) : (
              <GenericTable<RowRecord>
                columns={gtColumns}
                data={gtRows}
                loading={isLoadingData}
                variant="outlined"
                selectable={false}
                onRowClick={undefined}
              />
            )}
          </Paper>
        )}
      </div>
    </div>
  );
};
