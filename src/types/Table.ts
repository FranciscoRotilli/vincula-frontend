export interface Column<T> {
  key: keyof T;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export type Order = 'asc' | 'desc';

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number, pageSize: number) => void;
}

export interface RowAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
}

export interface GenericTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  pagination?: Pagination;
  selectable?: boolean;
  rowActions?: RowAction<T>[];
  onRowClick?: (row: T) => void;
}
