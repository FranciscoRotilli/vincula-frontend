import '@testing-library/jest-dom/vitest'

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect,it, vi } from 'vitest'

import GenericTable from '@/components/GenericTable'
import { Column, Order } from '@/types/Table'

type Row = { id: number; name: string; email: string }

const data: Row[] = [
  { id: 1, name: 'João',    email: 'joao@email.com' },
  { id: 2, name: 'Maria',   email: 'maria@email.com' },
  { id: 3, name: 'Pedro',   email: 'pedro@email.com' },
  { id: 4, name: 'Ana',     email: 'ana@email.com' },
  { id: 5, name: 'Carlos',  email: 'carlos@email.com' },
  { id: 6, name: 'Fernanda',email: 'fernanda@email.com' },
]

const columns: Column<Row>[] = [
  { key: 'name',  label: 'Nome' },
  { key: 'email', label: 'E-mail', render: (v) => <span data-testid="email-cell">{String(v).toUpperCase()}</span> },
]

async function clickTableHeaderByLabel(label: string | RegExp) {
  let btn: HTMLElement | undefined
  const all = screen.getAllByRole('button')
  btn = all.find((el) =>
    (el.getAttribute('aria-label') || el.textContent || '').match(label instanceof RegExp ? label : new RegExp(label, 'i'))
  )
  if (!btn) throw new Error(`Sort button não encontrado para "${String(label)}"`)
  await userEvent.click(btn)
}

describe('GenericTable — extended coverage', () => {
  it('early return: renders loading or empty when columns is empty', () => {
    const { rerender } = render(
      <GenericTable columns={[]} data={[]} loading={true} variant="outlined" />
    )
    expect(screen.getByRole('progressbar')).toBeInTheDocument()

    rerender(<GenericTable columns={[]} data={[]} loading={false} variant="outlined" />)
    expect(screen.getByTestId('cases-table')).toBeInTheDocument()
    expect(screen.getByText('Nenhum registro encontrado.')).toBeInTheDocument()
  })

it('client-side sorting toggles asc/desc and updates first row', async () => {
  const { container } = render(
    <GenericTable columns={columns} data={data} loading={false} variant="outlined" />
  )

  const tbody = container.querySelector('tbody') as HTMLElement
  const getRows = () => Array.from(tbody.querySelectorAll('tr'))

  let firstCell = within(getRows()[0]).getAllByRole('cell')[0]
  expect(firstCell).toHaveTextContent(/^Ana$/)

  await clickTableHeaderByLabel(/Nome/i)
  firstCell = within(getRows()[0]).getAllByRole('cell')[0]
  expect(firstCell).not.toHaveTextContent(/^Ana$/)

  await clickTableHeaderByLabel(/Nome/i)
  firstCell = within(getRows()[0]).getAllByRole('cell')[0]
  expect(firstCell).toHaveTextContent(/^Ana$/)
})



  it('uses custom render for email cells', () => {
    render(<GenericTable columns={columns} data={data.slice(0, 1)} loading={false} variant="outlined" />)
    expect(screen.getByTestId('email-cell')).toHaveTextContent(data[0].email.toUpperCase())
  })

  it('selectable=true: header select-all, row toggle, and onRowClick when clicking the row', async () => {
  const onRowClick = vi.fn()
  const { container } = render(
    <GenericTable
      columns={columns}
      data={data.slice(0, 3)}
      loading={false}
      variant="outlined"
      selectable
      onRowClick={onRowClick}
    />
  )

  const allCbs = screen.getAllByRole('checkbox')
  await userEvent.click(allCbs[0]) 

  const tbody = container.querySelector('tbody') as HTMLElement
  const getRowTrs = () => Array.from(tbody.querySelectorAll('tr'))
  const getRowCbs = () => within(tbody).getAllByRole('checkbox')

  getRowCbs().forEach(cb => expect(cb).toBeChecked())

  await userEvent.click(getRowTrs()[0])

  const rowCbsAfter = getRowCbs()
  expect(rowCbsAfter[0]).not.toBeChecked()

  expect(onRowClick).toHaveBeenCalledTimes(1)
  expect(onRowClick.mock.calls[0][0]).toMatchObject({ id: 1, name: 'João' })
})


  it('rowActions: icon button and link call onClick(row) and do not bubble to onRowClick', async () => {
  const actionIcon = vi.fn()
  const actionLink = vi.fn()
  const onRowClick = vi.fn()
  const { container } = render(
    <GenericTable
      columns={columns}
      data={data.slice(0, 1)}
      loading={false}
      variant="outlined"
      rowActions={[
        { label: 'Editar', icon: <span data-testid="edit-icon" />, onClick: actionIcon },
        { label: 'Remover', onClick: actionLink },
      ]}
      onRowClick={onRowClick}
    />
  )

  await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
  expect(actionIcon).toHaveBeenCalledTimes(1)
  expect(actionIcon.mock.calls[0][0]).toMatchObject({ id: 1 })

  await userEvent.click(screen.getByText('Remover'))
  expect(actionLink).toHaveBeenCalledTimes(1)
  expect(actionLink.mock.calls[0][0]).toMatchObject({ id: 1 })

  expect(onRowClick).toHaveBeenCalledTimes(0)

  const tbody = container.querySelector('tbody') as HTMLElement
  const firstBodyRow = tbody.querySelectorAll('tr')[0]
  await userEvent.click(firstBodyRow!)

  expect(onRowClick).toHaveBeenCalledTimes(1)
})


  it('client-side pagination: next page and change rows-per-page', async () => {
    render(<GenericTable columns={columns} data={data} loading={false} variant="outlined" />)

    const pagination = screen.getByTestId('table-pagination')
    expect(pagination).toBeInTheDocument()

    expect(screen.queryByText('Pedro')).not.toBeInTheDocument()

    const nextBtn = within(pagination).getByRole('button', { name: /next page/i })
    await userEvent.click(nextBtn)
    expect(screen.getByText('Pedro')).toBeInTheDocument()

    const rppCombo = within(pagination).getByRole('combobox', { name: /Linhas por página/i })
    await userEvent.click(rppCombo)
    const option10 = await screen.findByRole('option', { name: '10' })
    await userEvent.click(option10)

    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('Pedro')).toBeInTheDocument()
  })

  it('server-side pagination: calls onPageChange for page and rows-per-page', async () => {
    const onPageChange = vi.fn()
    render(
      <GenericTable
        columns={columns}
        data={data.slice(0, 5)}
        loading={false}
        variant="outlined"
        pagination={{ totalItems: 100, currentPage: 0, pageSize: 5, onPageChange }}
      />
    )

    const pagination = screen.getByTestId('table-pagination')
    const nextBtn = within(pagination).getByRole('button', { name: /next page/i })
    await userEvent.click(nextBtn)
    expect(onPageChange).toHaveBeenCalledWith(1, 5)

    const rppCombo = within(pagination).getByRole('combobox', { name: /Linhas por página/i })
    await userEvent.click(rppCombo)
    const option10 = await screen.findByRole('option', { name: '10' })
    await userEvent.click(option10)
    expect(onPageChange).toHaveBeenCalledWith(0, 10)
  })

  it('server-side sorting: clicking header calls onSort with new direction', async () => {
    const onSort = vi.fn()
    render(
      <GenericTable
        columns={columns}
        data={data.slice(0, 5)}
        loading={false}
        variant="outlined"
        sorting={{ sortBy: 'name', sortDir: 'asc' as Order }}
        onSort={onSort}
      />
    )
    await clickTableHeaderByLabel(/Nome/i)
    expect(onSort).toHaveBeenCalledWith({ sortBy: 'name', sortDir: 'desc' })
  })
})
