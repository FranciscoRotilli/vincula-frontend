import '@testing-library/jest-dom/vitest'

import { fireEvent,render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach,describe, expect, it, vi } from 'vitest'

import ButtonShowcase from '@/components/Button/ButtonShowcase'

global.alert = vi.fn()

describe('ButtonShowcase Component', () => {
  beforeEach(() => {
    ;(global.alert as any).mockReset?.()
  })

  it('renders all expected buttons (including duplicates)', () => {
    render(<ButtonShowcase />)

    expect(screen.getAllByRole('button', { name: /Contained/i })).toHaveLength(2)

    const singles = [/Outlined/i, /Error/i, /Edit/i, /Delete/i, /Small/i, /Large/i, /Disabled/i]
    for (const name of singles) {
      expect(screen.getAllByRole('button', { name })).toHaveLength(1)
    }
  })

  it('triggers alert when the FIRST "Contained" button is clicked', () => {
    render(<ButtonShowcase />)

    const [containedWithAlert] = screen.getAllByRole('button', { name: /Contained/i })
    fireEvent.click(containedWithAlert)

    expect(global.alert).toHaveBeenCalledWith('Contained')
  })

  it('does not trigger click when button is disabled', () => {
    render(<ButtonShowcase />)

    const disabledButton = screen.getByRole('button', { name: /Disabled/i })
    expect(disabledButton).toBeDisabled()

    fireEvent.click(disabledButton)
    expect(global.alert).not.toHaveBeenCalled()
  })

  it('renders buttons with icons (edit and delete)', () => {
    render(<ButtonShowcase />)

    const editButton = screen.getByRole('button', { name: /Edit/i })
    const deleteButton = screen.getByRole('button', { name: /Delete/i })

    expect(editButton.querySelector('svg')).toBeTruthy()
    expect(deleteButton.querySelector('svg')).toBeTruthy()
  })

  it('other active buttons are clickable without throwing', () => {
    render(<ButtonShowcase />)

    const outlinedButton = screen.getByRole('button', { name: /Outlined/i })
    const errorButton = screen.getByRole('button', { name: /Error/i })

    expect(outlinedButton).not.toBeDisabled()
    expect(errorButton).not.toBeDisabled()

    fireEvent.click(outlinedButton)
    fireEvent.click(errorButton)

    expect(true).toBe(true)
  })
})
