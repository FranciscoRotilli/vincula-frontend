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

export interface Sorting<T> {
  sortBy: keyof T;
  sortDir: Order;
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
  variant: 'outlined' | 'ghost';
  pagination?: Pagination;
  sorting?: Sorting<T>;
  selectable?: boolean;
  rowActions?: RowAction<T>[];
  onRowClick?: (row: T) => void;
  onSort?: (sorting: Sorting<T>) => void;
}
