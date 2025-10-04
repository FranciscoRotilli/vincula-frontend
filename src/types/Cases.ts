import { File } from './Files';

export type CaseStatus = 'Em andamento' | 'Suspenso' | 'Encerrado';

export type CaseItem = {
  id: string;
  name: string;
  owner: string;
  status: CaseStatus;
  creation_date: string;
};

export type CasesResponse = {
  total: number;
  page: number;
  limit: number;
  items: CaseItem[];
  sorting: ApiSortingParams;
};

export type CompleteCaseResponse = {
  id: string;
  status: CaseStatus;
  creation_date: string;
  name: string;
  case_number: number;
  owner: string;
  update_date: string;
  archives: File[];
  suspects: Suspect[];
};

export type Suspect = {
  id: string | number;
  name: string;
  cpf_cnpj: string;
  phone_number: string;
};

export type SuspectInput = {
  name: string;
  cpf_cnpj: string;
  phone_number: string;
};

export type PaginationParams = {
  page: number;
  limit: number;
};

export type FilterParams = {
  name?: string;
  owner?: string;
  status?: CaseStatus;
};

export type ApiSortingParams = {
  sort_dir?: 'asc' | 'desc';
  sort_by?: 'name' | 'status' | 'creation_date';
};
