'use client';

import { Alert, CircularProgress, Paper } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import React from 'react';

import Button from '@/components/Button';
import { CaseContainer } from '@/components/CaseContainer';
import Filter, { FieldConfig, FilterValues } from '@/components/Filter';
import GenericTable from '@/components/GenericTable';
import { getFileDataById } from '@/services/fileService';
import { t } from '@/texts';
import { FileFilterParams } from '@/types/Files';

import styles from './page.module.css';

export interface AvailableFile {
  id: string;
  name: string;
  label: string;
}

export interface FileData {
  [key: string]: string;
}

export interface SuspectOption {
  value: string;
  label: string;
}

type RowRecord = Record<string, unknown> & { id: string };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VinculosDadosPage({ params }: PageProps) {
  const { id } = React.use(params);
  const [data, setData] = useState<FileData[] | null>(null);
  const [_dataError, setDataError] = useState<string | null>(null);
  const [files, setFiles] = useState<AvailableFile[]>([]);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedFile, setSelectedFile] = useState<AvailableFile | null>(null);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>({
    suspects: [],
    names: [],
    cpfs_cnpjs: [],
    phones: [],
  });
  const [storedFilters, setStoredFilters] = useState<{ name: string; values: FilterValues }[]>([]);
  const [suspects, setSuspects] = useState<SuspectOption[]>([]);

  const fetchStoredCaseData = useCallback(() => {
    if (!id) return;
    try {
      setFilesError(null);
      setIsLoadingFiles(true);
      setIsLoadingData(true);

      const storedCase = localStorage.getItem('case');
      if (!storedCase) return;
      const parsedCase = JSON.parse(storedCase);
      if (parsedCase.id !== id) return;

      const caseArchives = parsedCase.archives.map(
        (file: { id: string; name: string | string[] }) => ({
          id: file.id,
          name: file.name,
          label: file.name.length > 20 ? `${file.name.slice(0, 17)}...` : file.name,
        })
      );
      const caseSuspects = parsedCase.suspects || [];
      const suspectOptions = caseSuspects.map((suspect: { name: string }) => ({
        value: suspect.name,
        label: `${suspect.name}`,
      }));

      setSuspects(suspectOptions);
      setFiles(caseArchives);
    } catch (error) {
      setFilesError(t('visualization.filesLoadError'));
    } finally {
      setIsLoadingFiles(false);
    }
  }, [id]);

  const fetchStoredCaseFilters = useCallback(() => {
    if (!id) return;
    const savedFilters = localStorage.getItem(`savedFilters_case_${id}`);
    if (!savedFilters) return;
    const parsedFilters = JSON.parse(savedFilters);
    setStoredFilters(parsedFilters);
  }, [id]);

  const handleFilter = (newFilters: FilterValues) => {
    const formattedFilters = {
      suspects: formatFilterValue(newFilters.suspects),
      names: formatFilterValue(newFilters.names),
      cpfs_cnpjs: formatFilterValue(newFilters.cpfs_cnpjs),
      phones: formatFilterValue(newFilters.phones),
    };
    setFilters(formattedFilters);
    fetchFileContent(formattedFilters);
  };

  const formatFilterValue = (value: string | string[] | undefined) => {
    if (value === undefined) return [];
    if (Array.isArray(value)) return value;
    return value
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  };

  const handleClear = () => {
    const emptyFilters = { suspects: [], names: [], cpfs_cnpjs: [], phones: [] };
    setFilters(emptyFilters);
    fetchFileContent(emptyFilters);
  };

  const handleSaveFilter = (filterName: string, filters: FilterValues) => {
    if (!filterName) return;
    const savedFilters = localStorage.getItem(`savedFilters_case_${id}`);
    const parsedFilters = savedFilters ? JSON.parse(savedFilters) : [];
    parsedFilters.push({ name: filterName, values: filters });
    localStorage.setItem(`savedFilters_case_${id}`, JSON.stringify(parsedFilters));
    fetchStoredCaseFilters();
  };

  const handleRemoveStoredFilter = (filterName: string) => {
    const savedFilters = localStorage.getItem(`savedFilters_case_${id}`);
    if (!savedFilters) return;
    let parsedFilters = JSON.parse(savedFilters);
    parsedFilters = parsedFilters.filter((filter: { name: string }) => filter.name !== filterName);
    localStorage.setItem(`savedFilters_case_${id}`, JSON.stringify(parsedFilters));
    fetchStoredCaseFilters();
  };

  const handleFileClick = (file: AvailableFile) => {
    setSelectedFile(file);
    fetchFileContent();
  };

  const fetchFileContent = (fileFilters?: FileFilterParams) => {
    if (!selectedFile) return;

    setLoadingFileId(selectedFile.id);

    setIsLoadingData(true);
    setData(null);
    setDataError(null);

    if (!fileFilters) {
      fileFilters = {
        suspects: filters.suspects,
        names: filters.names,
        cpfs_cnpjs: filters.cpfs_cnpjs,
        phones: filters.phones,
      } as FileFilterParams;
    }

    getFileDataById(id, selectedFile.id, fileFilters)
      .then((fileData) => {
        setData(fileData.content);
      })
      .catch((_err) => setDataError(t('visualization.dataLoadError')))
      .finally(() => {
        setIsLoadingData(false);
        setLoadingFileId(null);
      });
  };

  const formatColumnLabel = (label: string) => {
    return label
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\sºª]/g, '_')
      .toUpperCase();
  };

  const renderFileChips = () => {
    if (isLoadingFiles) return <CircularProgress size={24} />;
    if (filesError) return <Alert severity="error">{filesError}</Alert>;
    if (files.length === 0) return <div>{t('visualization.noFiles')}</div>;

    return (
      <div className={styles.chipsContainer}>
        {files.map((file) => {
          return (
            <Button
              key={file.id}
              label={file.label}
              onClick={() => handleFileClick(file)}
              disabled={loadingFileId !== null}
              variant="contained"
              data-testid={`file-chip-${file.id}`}
            />
          );
        })}
      </div>
    );
  };

  const fileColumns = useMemo(() => {
    const source = data;
    if (!source) return [];
    return Object.keys(source[0] || {}).map((col) => ({
      key: col as keyof RowRecord,
      label: formatColumnLabel(col),
      align: 'left' as const,
    }));
  }, [data]);

  const fileRows = useMemo<RowRecord[]>(() => {
    const source = data;
    if (!source) return [];
    return source.map((row: FileData, idx: number) => ({
      id: `${selectedFile?.id ?? 'file'}-${idx}`,
      ...row,
    }));
  }, [data, selectedFile?.id]);

  const hasFiltersApplied =
    (Array.isArray(filters.suspects) && filters.suspects.length > 0) ||
    (Array.isArray(filters.names) && filters.names.length > 0) ||
    (Array.isArray(filters.cpfs_cnpjs) && filters.cpfs_cnpjs.length > 0) ||
    (Array.isArray(filters.phones) && filters.phones.length > 0);

  const filterFields: FieldConfig[] = [
    {
      key: 'suspects',
      label: t('filter.label1'),
      type: 'multi-select',
      options: suspects,
      placeholder: t('filter.placeholder1'),
    },
    {
      key: 'cpfs_cnpjs',
      label: t('filter.label2'),
      type: 'input',
      placeholder: t('filter.placeholder2'),
    },
    {
      key: 'names',
      label: t('filter.label3'),
      type: 'input',
      placeholder: t('filter.placeholder3'),
    },
    {
      key: 'phones',
      label: t('filter.label4'),
      type: 'input',
      placeholder: t('filter.placeholder4'),
    },
  ];

  useEffect(() => {
    fetchStoredCaseData();
    fetchStoredCaseFilters();
  }, [id, fetchStoredCaseData, fetchStoredCaseFilters]);

  return (
    <CaseContainer caseId={id}>
      <div className={styles.gridContainer}>
        <Paper variant="outlined" className={styles.filters} data-testid="filters">
          <div className={styles.texts}>
            <h1 className={styles.title3}>{t('visualization.filters')}</h1>
            <p className={styles.body5} color="text.secondary">
              {t('visualization.filtersDesc')}
            </p>
          </div>
          <div className={styles.chipsContainer}>
            {storedFilters.map((filter, i) => (
              <Button
                key={i}
                label={filter.name}
                onClick={() => handleFilter(filter.values)}
                onRemove={() => handleRemoveStoredFilter(filter.name)}
                variant="contained"
              />
            ))}
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
                onSaveFilter={handleSaveFilter}
                values={filters}
                onValuesChange={(values) => setFilters(values)}
                customStyles={{
                  container: styles.tableFilters,
                  fieldsRow: styles.fieldsRow,
                  actions: styles.filterActions,
                }}
              />
            </div>

            {!isLoadingData && fileRows.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div>
                  {hasFiltersApplied
                    ? 'Nenhum resultado encontrado para os filtros aplicados.'
                    : t('visualization.noData')}
                </div>
                {hasFiltersApplied && (
                  <Button
                    variant="outlined"
                    onClick={handleClear}
                    label={t('visualization.clearButton')}
                  />
                )}
              </div>
            ) : (
              <GenericTable<RowRecord>
                columns={fileColumns}
                data={fileRows}
                loading={isLoadingData}
                variant="outlined"
                selectable={false}
                onRowClick={undefined}
              />
            )}
          </Paper>
        )}
      </div>
    </CaseContainer>
  );
}
