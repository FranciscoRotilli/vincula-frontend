import { describe, expect,it } from 'vitest'

import theme, { colors } from '../../src/theme/theme'

describe('theme configuration', () => {
  it('exports all expected colors with correct hex values', () => {
    expect(colors).toEqual({
      BACKGROUND: '#FAFAFA',
      SELECTIVE_YELLOW: '#FFB703',
      UT_ORANGE: '#FB8500',
      VERMILION: '#F33131',
      LIGHT_GREEN: '#8CDC88',
      LIME_GREEN: '#3DBB02',
      WHITE: '#FFFFFF',
      ANTI_FLASH_WHITE: '#F1F1F1',
      GRAY: '#808080',
      EERIE_BLACK: '#1A1A1A',
      BLACK: '#000000',
    })
  })

  it('creates a valid MUI theme object', () => {
    expect(theme).toBeDefined()
    expect(theme.palette).toBeDefined()
    expect(theme.palette.primary.main).toBe(colors.SELECTIVE_YELLOW)
    expect(theme.palette.primary.contrastText).toBe(colors.BLACK)
    expect(theme.palette.secondary.main).toBe(colors.UT_ORANGE)
    expect(theme.palette.secondary.contrastText).toBe(colors.WHITE)
    expect(theme.palette.error.main).toBe(colors.VERMILION)
    expect(theme.palette.success.main).toBe(colors.LIME_GREEN)
    expect(theme.palette.warning.main).toBe(colors.SELECTIVE_YELLOW)
    expect(theme.palette.background.default).toBe(colors.BACKGROUND)
    expect(theme.palette.background.paper).toBe(colors.ANTI_FLASH_WHITE)
    expect(theme.palette.text.primary).toBe(colors.EERIE_BLACK)
    expect(theme.palette.text.secondary).toBe(colors.GRAY)
    expect(theme.palette.common.black).toBe(colors.BLACK)
    expect(theme.palette.common.white).toBe(colors.WHITE)
  })

  it('keeps palette keys consistent', () => {
    const paletteKeys = Object.keys(theme.palette)
    expect(paletteKeys).toContain('primary')
    expect(paletteKeys).toContain('secondary')
    expect(paletteKeys).toContain('error')
    expect(paletteKeys).toContain('success')
    expect(paletteKeys).toContain('warning')
    expect(paletteKeys).toContain('background')
    expect(paletteKeys).toContain('text')
    expect(paletteKeys).toContain('common')
  })
})
