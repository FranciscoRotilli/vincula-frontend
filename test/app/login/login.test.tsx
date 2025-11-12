/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach,describe, expect, it, vi } from 'vitest'

vi.mock('@/components/Navbar', () => ({
  __esModule: true,
  default: vi.fn((props: any) => (
    <div data-testid="navbar">
      NavbarMock - {props.user?.name} ({props.user?.role})
      <button onClick={() => props.onNavigate('/home')}>Go Home</button>
      <button onClick={props.onLogout}>Logout</button>
    </div>
  )),
}))


vi.mock('@/texts', () => ({
  t: vi.fn((key: string) => `[${key}]`),
}))

import LoginPage from '@/app/login/page'
import Navbar from '@/components/Navbar'
import { t } from '@/texts'

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Navbar and login title text', () => {
    render(<LoginPage />)

    expect(screen.getByTestId('navbar')).toBeInTheDocument()

    expect(t).toHaveBeenCalledWith('login.title')
    
    expect(screen.getByText('[login.title]')).toBeInTheDocument()
  })

  it('passes correct props to Navbar', () => {
    render(<LoginPage />)
    expect(Navbar).toHaveBeenCalledTimes(1)
    const props = (Navbar as any).mock.calls[0][0]
    expect(props.user).toEqual({ name: 'Usuário Exemplo', role: 'Admin' })
    expect(typeof props.onNavigate).toBe('function')
    expect(typeof props.onLogout).toBe('function')
  })

  it('calls console.log when onNavigate or onLogout are triggered', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    render(<LoginPage />)

    const navButton = screen.getByText(/Go Home/)
    const logoutButton = screen.getByText(/Logout/)

    navButton.click()
    logoutButton.click()

    expect(consoleSpy).toHaveBeenCalledWith('ir para:', '/home')
    expect(consoleSpy).toHaveBeenCalledWith('logout')
    consoleSpy.mockRestore()
  })
})
