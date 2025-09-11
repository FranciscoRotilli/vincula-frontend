export type CaseItem = {
  id: string;
  name: string;
  owner: string;
  status: string;
  creation_date: string;
}

export type ApiResponse = {
  total: number;
  page: number;
  limit: number;
  items: CaseItem[];
}

export type PaginationParams = {
  page: number,
  limit: number
}

export type FilterParams = {
  name?: string,
  owner?: string,
  status?: string
}