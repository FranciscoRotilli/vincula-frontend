"use client";

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
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import React, { useMemo, useState } from "react";

import styles from "./generic-table.module.css"

export interface Column<T> {
  key: keyof T;
  label: string;
  align?: "left" | "center" | "right";
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export type Order = "asc" | "desc";

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number, pageSize: number) => void;
}

interface GenericTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  pagination?: Pagination; // se não vier, cai no client-side
  selectable?: boolean;
  onRowClick?: (row: T) => void;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  const valueA = a[orderBy];
  const valueB = b[orderBy];

  if (valueB < valueA) return -1;
  if (valueB > valueA) return 1;
  return 0;
}

function getComparator<T>(
  order: Order,
  orderBy: keyof T
): (a: T, b: T) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export default function GenericTable<T extends { id: number | string }>({
  columns,
  data,
  loading,
  pagination,
  selectable = false,
  onRowClick,
}: GenericTableProps<T>) {
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof T>(columns[0].key);
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const isPaginationServerSide = !!pagination;

  const clientSideRows = useMemo(() => {
    return [...data]
      .sort(getComparator(order, orderBy))
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [data, order, orderBy, page, rowsPerPage]);

  const rows = isPaginationServerSide ? data : clientSideRows;

  const handleSort = (property: keyof T) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = data.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleRowClick = (
    event: React.MouseEvent<unknown>,
    id: string | number,
    row: T
  ) => {
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

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      <TableContainer className={styles.tableContainer}>
        {loading ? (
          <CircularProgress size={40} className={styles.loading} />
        ) : (
          <Table stickyHeader aria-label="generic table">
            <TableHead className={styles.tableHead}>
              <TableRow>
                {selectable && (
                  <TableCell
                    className={styles.headTableCell}
                    padding="checkbox"
                  >
                    <Checkbox
                      color="primary"
                      indeterminate={
                        selected.length > 0 && selected.length < data.length
                      }
                      checked={
                        data.length > 0 && selected.length === data.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    className={styles.headTableCell}
                    key={String(column.key)}
                    align={column.align || "left"}
                    sortDirection={orderBy === column.key ? order : false}
                  >
                    <TableSortLabel
                      className={styles.tableCellLabel}
                      active={orderBy === column.key}
                      direction={orderBy === column.key ? order : "asc"}
                      onClick={() => handleSort(column.key)}
                    >
                      {column.label}
                      {orderBy === column.key && (
                        <Box component="span" sx={visuallyHidden}>
                          {order === "desc"
                            ? "ordenado decrescente"
                            : "ordenado crescente"}
                        </Box>
                      )}
                    </TableSortLabel>
                  </TableCell>
                ))}
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
                          <TableCell
                            key={String(column.key)}
                            align={column.align || "left"}
                          >
                            {column.render
                              ? column.render(value, row)
                              : (value as React.ReactNode)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    align="center"
                  >
                    Nenhum dado encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={isPaginationServerSide ? pagination!.totalItems : data.length}
        rowsPerPage={isPaginationServerSide ? pagination!.pageSize : rowsPerPage}
        page={isPaginationServerSide ? pagination!.currentPage : page}
        labelRowsPerPage="Linhas por página"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} de ${count}`
        }
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}