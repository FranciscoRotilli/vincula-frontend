import { describe, expect,it } from 'vitest'

import { t, type TextKey,texts } from '@/texts'

describe('texts map & t() translator', () => {
  it('exposes a non-empty dictionary of string messages', () => {
    const keys = Object.keys(texts)
    expect(Array.isArray(keys)).toBe(true)
    expect(keys.length).toBeGreaterThan(10)
    expect(keys).toContain('navbar.logout')
    expect(keys).toContain('genericTable.noData')
  })

  it('returns exact string for simple keys (no interpolation)', () => {
    expect(t('navbar.logout')).toBe(texts['navbar.logout'])
    expect(t('genericTable.noData')).toBe('Nenhum registro encontrado.')
  })

  it('performs interpolation with {count} (files.title)', () => {
    expect(t('files.title', { count: 3 })).toBe('Arquivos (3)')
    expect(t('files.title', { count: 0 })).toBe('Arquivos (0)')
    expect(t('files.title', { count: 7, extra: 99 as unknown as number })).toBe('Arquivos (7)')
  })

  it('performs interpolation with {count} (visualization.availableFiles)', () => {
    expect(t('visualization.availableFiles', { count: 12 }))
      .toBe('Arquivos Disponíveis (12)')
  })

  it('leaves placeholder intact when vars are omitted', () => {
    expect(t('files.title')).toBe('Arquivos ({count})')
    expect(t('visualization.availableFiles')).toBe('Arquivos Disponíveis ({count})')
  })

  it('works for all keys (smoke test) and always returns a string', () => {
    (Object.keys(texts) as TextKey[]).forEach((key) => {
      const res = t(key) 
      expect(typeof res).toBe('string')
      expect(res.length).toBeGreaterThan(0)
    })
  })

  it('does not alter braces that are not placeholders', () => {
    const raw = texts['files.title'] 
    const replaced = t('files.title', { count: 42 })
    expect(raw.includes('{count}')).toBe(true)
    expect(replaced).toBe('Arquivos (42)')
  })
})
