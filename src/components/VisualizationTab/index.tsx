'use client';

import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import {
  Alert,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import ButtonCerto from '@/components/Button';
import Filter, { FieldConfig, FilterValues } from '@/components/Filter';
import { t } from '@/texts';

import {
  AvailableFile,
  FileData,
  getAvailableFiles,
  getFileData,
} from '../../services/mock/visualizationService';
import styles from './VisualizationTab.module.css';

interface VisualizationTabProps {
  caseId: string;
}

export const VisualizationTab = ({ caseId }: VisualizationTabProps) => {
  const [data, setData] = useState<FileData | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
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
          const response = await fetch(`/api/cases/${caseId}`);
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
    if (files.length === 0)
      return <Typography>{t('visualization.noFiles')}</Typography>;

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

  const renderDataTable = () => {
    if (isLoadingData) return <CircularProgress sx={{ mt: 2 }} />;
    if (dataError) return <Alert severity="error">{dataError}</Alert>;

    const dataToRender = filteredData || data;
    if (!dataToRender || dataToRender.rows.length === 0) {
      const hasFilters =
        filters.investigado?.trim() ||
        filters.cpfCnpj?.trim() ||
        filters.destino?.trim();
      const message = hasFilters
        ? 'Nenhum resultado encontrado para os filtros aplicados.'
        : t('visualization.noData');

      return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Typography sx={{ mt: 2, color: 'text.secondary' }}>{message}</Typography>
          {hasFilters && (
            <Button variant="text" onClick={handleClear} sx={{ mt: 1 }}>
              {t('visualization.clearButton')}
            </Button>
          )}
        </div>
      );
    }

    return (
      <TableContainer className={styles.tableWrapper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {dataToRender.columns.map((col) => (
                <TableCell key={col} className={styles.tableHeaderCell}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {dataToRender.rows.map((row, rowIndex) => (
              <TableRow key={rowIndex} hover className={styles.tableRow}>
                {dataToRender.columns.map((col) => (
                  <TableCell key={`${rowIndex}-${col}`} className={styles.tableCell}>
                    {String(row[col] || '')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

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
            <Typography variant="h6" gutterBottom>
              {t('visualization.filters')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('visualization.filtersDesc')}
            </Typography>
          </div>
          <div className={styles.chipsContainer}>
            <ButtonCerto label="CPF - Beto Barbosa" onClick={() => {}} variant="contained" />
            <ButtonCerto label="CPF - Destino X" onClick={() => {}} variant="contained" />
          </div>
        </Paper>

        <Paper variant="outlined" className={styles.files} data-testid="files">
          <div className={styles.texts}>
            <Typography variant="h6" gutterBottom>
              {t('visualization.availableFiles', {
                count: isLoadingFiles ? t('visualization.loading') : files.length,
              })}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              className={styles.sectionSubtitle}
            >
              {t('visualization.availableFilesDesc')}
            </Typography>
          </div>
          {renderFileChips()}
        </Paper>

        {selectedFile && (
          <Paper variant="outlined" className={styles.tableContainer}>
            <Typography variant="h6" gutterBottom className={styles.fileName}>
              {selectedFile.name}
              {filteredData && (
                <Typography
                  variant="caption"
                  component="span"
                  sx={{ ml: 2, color: 'text.secondary' }}
                >
                  ({filteredData.rows.length}{' '}
                  {filteredData.rows.length === 1 ? 'registro' : 'registros'})
                </Typography>
              )}
            </Typography>

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
            {renderDataTable()}
          </Paper>
        )}
      </div>
    </div>
  );
};
