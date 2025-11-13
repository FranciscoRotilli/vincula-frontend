export type FileEntry = { id: string; name: string };

export async function getAvailableFiles(_caseId: string): Promise<FileEntry[]> {
  // minimal implementation so test imports resolve; tests will mock this
  return [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getFileData(_caseId: string, _fileId: string, _filters?: any) {
  // minimal implementation so test imports resolve; tests will mock this
  return { columns: [], rows: [] };
}

const visualizationService = {
  getAvailableFiles,
  getFileData,
};

export default visualizationService;
