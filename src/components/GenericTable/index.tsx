'use client';

import {
  Box,
  Checkbox,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import React, { useMemo, useState } from 'react';

import { t } from '@/texts';

import { GenericTableProps, Order } from '../../types/Table';
import styles from './GenericTable.module.css';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  const valueA = a[orderBy];
  const valueB = b[orderBy];

  if (valueB < valueA) return -1;
  if (valueB > valueA) return 1;
  return 0;
}

function getComparator<T>(order: Order, orderBy: keyof T): (a: T, b: T) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export default function GenericTable<T extends { id: number | string }>({
  columns,
  data,
  loading,
  variant,
  pagination,
  sorting,
  selectable = false,
  rowActions,
  onRowClick,
  onSort,
}: GenericTableProps<T>) {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof T>(columns[0].key);
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const isPaginationServerSide = !!pagination;
  const isSortingServerSide = !!sorting;
  const shouldHavePagination = (pagination?.totalItems ?? 0) > 5 || data.length > 5;

  const currentOrderBy = isSortingServerSide ? sorting.sortBy : orderBy;
  const currentOrder = isSortingServerSide ? sorting.sortDir : order;

  const clientSideRows = useMemo(() => {
    return [...data]
      .sort(getComparator(currentOrder, currentOrderBy))
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [data, currentOrder, currentOrderBy, page, rowsPerPage]);

  const rows = isPaginationServerSide ? data : clientSideRows;

  const handleSort = (property: keyof T) => {
    const isAsc = currentOrderBy === property && currentOrder === 'asc';
    const newDirection = isAsc ? 'desc' : 'asc';
    if (isSortingServerSide) {
      onSort?.({ sortBy: property, sortDir: newDirection });
    } else {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = data.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleRowClick = (event: React.MouseEvent<unknown>, id: string | number, row: T) => {
    if (selectable) {
      const selectedIndex = selected.indexOf(id);
      let newSelected: (string | number)[] = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else {
        newSelected = selected.filter((s) => s !== id);
      }
      setSelected(newSelected);
    }
    if (onRowClick) onRowClick(row);
  };

  const isSelected = (id: number | string) => selected.includes(id);

  const handleChangePage = (_event: unknown, newPage: number) => {
    if (isPaginationServerSide) {
      pagination!.onPageChange(newPage, pagination!.pageSize);
    } else {
      setPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value, 10);
    if (isPaginationServerSide) {
      pagination!.onPageChange(0, newSize);
    } else {
      setRowsPerPage(newSize);
      setPage(0);
    }
  };

  return (
    <Paper className={styles.tablePaper}>
      <TableContainer className={styles.tableContainer} data-testid="cases-table">
        {loading ? (
          <div className={styles.emptyAndLoadingContainer}>
            <CircularProgress size={40} className={styles.loading} />
          </div>
        ) : (
          <Table stickyHeader aria-label="generic table">
            <TableHead className={styles.tableHead}>
              <TableRow>
                {selectable && (
                  <TableCell
                    className={`${styles.headTableCell} ${variant === 'outlined' ? styles.outlined : ''}`}
                    padding="checkbox"
                  >
                    <Checkbox
                      color="primary"
                      indeterminate={selected.length > 0 && selected.length < data.length}
                      checked={data.length > 0 && selected.length === data.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    className={`${styles.headTableCell} ${variant === 'outlined' ? styles.outlined : ''}`}
                    key={String(column.key)}
                    align={column.align || 'left'}
                    sortDirection={currentOrderBy === column.key ? currentOrder : false}
                  >
                    <TableSortLabel
                      className={styles.tableCellLabel}
                      active={currentOrderBy === column.key}
                      direction={currentOrderBy === column.key ? currentOrder : 'asc'}
                      onClick={() => handleSort(column.key)}
                    >
                      {column.label}
                      {currentOrderBy === column.key && (
                        <Box component="span" sx={visuallyHidden}>
                          {currentOrder === 'desc' ? 'ordenado decrescente' : 'ordenado crescente'}
                        </Box>
                      )}
                    </TableSortLabel>
                  </TableCell>
                ))}
                {rowActions && (
                  <TableCell
                    className={`${styles.headTableCell} ${variant === 'outlined' ? styles.outlined : ''}`}
                    align="center"
                  >
                    {t('genericTable.action')}
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows && rows.length !== 0 ? (
                rows.map((row) => {
                  const isItemSelected = isSelected(row.id);
                  return (
                    <TableRow
                      hover
                      key={row.id}
                      role="checkbox"
                      tabIndex={-1}
                      selected={isItemSelected}
                      aria-checked={isItemSelected}
                      className={styles.tableRow}
                      onClick={(event) => handleRowClick(event, row.id, row)}
                    >
                      {selectable && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            className={styles.tableCheckbox}
                            color="primary"
                            checked={isItemSelected}
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => {
                        const value = row[column.key];
                        return (
                          <TableCell key={String(column.key)} align={column.align || 'left'}>
                            {column.render ? column.render(value, row) : (value as React.ReactNode)}
                          </TableCell>
                        );
                      })}
                      {rowActions && (
                        <TableCell align="center">
                          {rowActions.map((action, index) => {
                            const handleClick = (e: React.MouseEvent) => {
                              e.stopPropagation();
                              action.onClick(row);
                            };

                            return action.icon ? (
                              <button
                                key={index}
                                onClick={handleClick}
                                className={styles.actionButton}
                                aria-label={action.label}
                              >
                                {action.icon}
                              </button>
                            ) : (
                              <a
                                key={index}
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleClick(e);
                                }}
                                className={styles.actionLink}
                              >
                                {action.label}
                              </a>
                            );
                          })}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow className={styles.emptyAndLoadingContainer}>
                  <TableCell
                    colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                    align="center"
                    data-testid="generic-table-no-data"
                  >
                    {t('genericTable.noData')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {shouldHavePagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={isPaginationServerSide ? pagination!.totalItems : data.length}
          rowsPerPage={isPaginationServerSide ? pagination!.pageSize : rowsPerPage}
          page={isPaginationServerSide ? pagination!.currentPage : page}
          labelRowsPerPage="Linhas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          data-testid="table-pagination"
        />
      )}
    </Paper>
  );
}
