import React, { useEffect, useState } from 'react';

import Filter, { FilterValues } from '@/components/Filter';
import { getAvailableFiles, getFileData } from '@/services/mock/visualizationService';

type FileItem = { id: string; name: string };

export const VisualizationTab: React.FC<{ caseId: string }> = ({ caseId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [_selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [fileData, setFileData] = useState<{
    columns: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows: Record<string, any>[];
  } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [displayedRows, setDisplayedRows] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    getAvailableFiles(caseId)
      .then((res) => {
        if (!mounted) return;
        setFiles(res || []);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Error');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [caseId]);

  const handleSelectFile = async (id: string) => {
    setSelectedFileId(id);
    setFileData(null);
    setDisplayedRows([]);
    try {
      const data = await getFileData(caseId, id);
      setFileData(data);
      setDisplayedRows(data.rows || []);
    } catch (e) {
      setError('Error');
    }
  };

  if (loading) return <div role="progressbar" />;
  if (error) return <div role="alert">{error}</div>;

  return (
    <div>
      <div>
        {files.map((f) => (
          <div key={f.id} onClick={() => handleSelectFile(f.id)}>
            {f.name}
          </div>
        ))}
      </div>

      {fileData && (
        <div>
          <Filter
            fields={[{ key: 'cpfCnpj', label: 'CPF/CNPJ ORIGEM', type: 'input' as const }]}
            onFilter={(values: FilterValues) => {
              const term = String(values.cpfCnpj || '').trim();
              if (!term) return;
              const filtered = (fileData.rows || []).filter((row) =>
                Object.values(row).some((v) => String(v ?? '').includes(term))
              );
              setDisplayedRows(filtered);
            }}
            onClear={() => setDisplayedRows(fileData.rows || [])}
          />

          <table>
            <thead>
              <tr>
                {fileData.columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedRows.map((row, i) => (
                <tr key={i}>
                  {fileData.columns.map((c) => (
                    <td key={c}>{String(row[c] ?? '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VisualizationTab;
