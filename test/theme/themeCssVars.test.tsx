import { ThemeProvider } from '@mui/material/styles'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect,it } from 'vitest'

import theme from '../../src/theme/theme'
import { ThemeCssVars } from '../../src/theme/ThemeCssVars'

function esc(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getGlobalStylesText(): string {
  const styles = Array.from(document.querySelectorAll('style'))
  const match = styles.find(s => s.textContent?.includes('--color-background'))
  if (!match) {
    throw new Error('GlobalStyles style tag with CSS variables was not found')
  }
  return match.textContent || ''
}

describe('ThemeCssVars', () => {
  it('injects CSS variables into :root using the theme palette', () => {
    render(
      <ThemeProvider theme={theme}>
        <ThemeCssVars />
      </ThemeProvider>
    )

    const css = getGlobalStylesText()

    expect(css).toMatch(new RegExp(`--color-background:\\s*${esc(theme.palette.background.default)}`))
    expect(css).toMatch(new RegExp(`--color-anti-flash-white:\\s*${esc(theme.palette.background.paper)}`))

    expect(css).toMatch(new RegExp(`--color-eerie-black:\\s*${esc(theme.palette.text.primary)}`))
    expect(css).toMatch(new RegExp(`--color-gray:\\s*${esc(theme.palette.text.secondary)}`))

    expect(css).toMatch(new RegExp(`--color-selective-yellow:\\s*${esc(theme.palette.primary.main)}`))
    expect(css).toMatch(new RegExp(`--color-ut-orange:\\s*${esc(theme.palette.secondary.main)}`))
    expect(css).toMatch(new RegExp(`--color-vermilion:\\s*${esc(theme.palette.error.main)}`))

    const expectedLight = theme.palette.success.light ?? '#8CDC88'
    expect(css).toMatch(new RegExp(`--color-light-green:\\s*${esc(expectedLight)}`))
    expect(css).toMatch(new RegExp(`--color-lime-green:\\s*${esc(theme.palette.success.main)}`))

    expect(css).toMatch(new RegExp(`--color-white:\\s*${esc(theme.palette.common.white)}`))
    expect(css).toMatch(new RegExp(`--color-black:\\s*${esc(theme.palette.common.black)}`))
  })

  it('renders without crashing (sanity)', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <ThemeCssVars />
      </ThemeProvider>
    )
    const css = getGlobalStylesText()
    expect(css.length).toBeGreaterThan(0)
    expect(container).toBeTruthy()
  })
})
