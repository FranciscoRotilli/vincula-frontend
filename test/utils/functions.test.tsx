import { describe, expect,it } from 'vitest'

import {
  capitalize,
  formatDate,
  maskCpfCnpj,
  maskPhone,
  onlyNumbers,
} from '@/utils/functions'

describe('utils/functions', () => {
  describe('maskCpfCnpj', () => {
    it('masks CPF (11 digits)', () => {
      expect(maskCpfCnpj('12345678901')).toBe('123.456.789-01')
    })

    it('masks CPF even if it includes punctuation already', () => {
      expect(maskCpfCnpj('123.456.789-01')).toBe('123.456.789-01')
    })

    it('handles partial CPF (less than 11 digits) progressively', () => {
      expect(maskCpfCnpj('1')).toBe('1')
      expect(maskCpfCnpj('12')).toBe('12')
      expect(maskCpfCnpj('1234')).toBe('123.4')
      expect(maskCpfCnpj('1234567')).toBe('123.456.7')
      expect(maskCpfCnpj('1234567890')).toBe('123.456.789-0')
    })

    it('masks CNPJ (14 digits)', () => {
      expect(maskCpfCnpj('12345678000199')).toBe('12.345.678/0001-99')
    })

    it('masks CNPJ even with non-digits mixed in', () => {
      expect(maskCpfCnpj('12.345.678/0001-99')).toBe('12.345.678/0001-99')
    })
  })

  describe('maskPhone', () => {
    it('masks 11-digit cellphone as (XX) XXXXX-XXXX', () => {
      expect(maskPhone('11987654321')).toBe('(11) 98765-4321')
    })

    it('masks 10-digit landline as (XX) XXXX-XXXX', () => {
      expect(maskPhone('1132654321')).toBe('(11) 3265-4321')
    })

    it('returns original when not 10 or 11 numeric chars', () => {
      expect(maskPhone('999')).toBe('999')
      expect(maskPhone('(11) 9 8765-4321 ext. 12')).toBe('(11) 9 8765-4321 ext. 12')
    })
  })

  describe('capitalize', () => {
    it('capitalizes the first character', () => {
      expect(capitalize('flávia')).toBe('Flávia')
    })

    it('returns empty string when input is empty', () => {
      expect(capitalize('')).toBe('')
    })
  })

  describe('onlyNumbers', () => {
    it('keeps only digits', () => {
      expect(onlyNumbers('A1B2C3-.-/ 45')).toBe('12345')
      expect(onlyNumbers('(11) 98765-4321')).toBe('11987654321')
    })
  })

  describe('formatDate', () => {
    it('formats Date objects as DD/MM/YYYY', () => {
      const d = new Date(2025, 0, 5)
      expect(formatDate(d)).toBe('05/01/2025')
    })

    it('formats from string inputs that the Date ctor understands', () => {
      const d = new Date(2025, 9, 1) 
      expect(formatDate(d.toString())).toBe('01/10/2025')
    })
  })
})
