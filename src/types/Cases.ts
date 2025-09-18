export type CaseItem = {
  id: string;
  name: string;
  owner: string;
  status: 'Em andamento' | 'Suspenso' | 'Encerrado';
  creation_date: string;
}

export type ApiResponse = {
  total: number;
  page: number;
  limit: number;
  items: CaseItem[];
  sorting: ApiSortingParams;
}

export type PaginationParams = {
  page: number;
  limit: number;
}

export type FilterParams = {
  name?: string;
  owner?: string;
  status?: 'Em andamento' | 'Suspenso' | 'Encerrado';
}

export type ApiSortingParams = {
  sort_dir?: 'asc' | 'desc';
  sort_by?: 'name' | 'status' | 'creation_date';
}