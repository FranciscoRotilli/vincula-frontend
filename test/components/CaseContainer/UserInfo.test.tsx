import '@testing-library/jest-dom/vitest'

import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect,it } from 'vitest'

import UserInfo from '@/components/CaseContainer/UserInfo'

vi.mock('@/components/CaseContainer/CaseContainer.module.css', () => ({
  default: {
    userInfo: 'userInfo',
    userName: 'userName',
    userRole: 'userRole',
  },
}))

describe('UserInfo Component', () => {
  it('renders the user name and role correctly', () => {
    render(<UserInfo name="Alice Johnson" role="Investigator" />)
    
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('Investigator')).toBeInTheDocument()
  })

  it('applies the correct CSS classes', () => {
    render(<UserInfo name="John Doe" role="Analyst" />)

    const container = screen.getByText('John Doe').closest('div')
    expect(container).toHaveClass('userInfo')
    expect(screen.getByText('John Doe')).toHaveClass('userName')
    expect(screen.getByText('Analyst')).toHaveClass('userRole')
  })
})
