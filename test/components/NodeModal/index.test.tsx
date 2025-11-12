import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen, within } from '@testing-library/react'
import React from 'react'
import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest'

const maskCpfCnpjMock = vi.fn((v: string) => `MASKED:${v}`)
const maskPhoneMock = vi.fn((v: string) => `PHONE:${v}`)
vi.mock('@/utils/functions', () => ({
  maskCpfCnpj: (val: string) => maskCpfCnpjMock(val),
  maskPhone: (val: string) => maskPhoneMock(val),
}))
vi.mock('@/texts', () => ({
  t: (key: string) => key,
}))

vi.mock('react-icons/fi', () => ({
  FiX: (props: any) => <span data-testid="fi-x" {...props} />,
}))

import NodeModal from '@/components/NodeModal'

describe('NodeModal', () => {
  beforeEach(() => {
    maskCpfCnpjMock.mockClear()
    maskPhoneMock.mockClear()
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when isOpen=false', () => {
    render(
      <NodeModal
        isOpen={false}
        onClose={() => {}}
        name="Hidden"
        cpfCnpj="00000000000"
      />
    )
    expect(screen.queryByText(/HIDDEN/i)).not.toBeInTheDocument()
  })

  it('renders a person/entity node (isRelationship=false) with masked cpf/cnpj and phone, and supports close', () => {
    const onClose = vi.fn()
    render(
      <NodeModal
        isOpen
        onClose={onClose}
        name="Ailson Barbosa"
        quantity={49}
        cpfCnpj="00000000000"
        phone="11999999999"
        caseNumber="CASE-42"
        files={['fileA.pdf', 'fileB.txt']}
      />
    )

    expect(screen.getByText('AILSON BARBOSA')).toBeInTheDocument()
   expect(screen.getByText('nodeModal.quantity')).toBeInTheDocument()
    expect(screen.getByText('49')).toBeInTheDocument()

    expect(maskCpfCnpjMock).toHaveBeenCalledWith('00000000000')
    expect(screen.getByText('MASKED:00000000000')).toBeInTheDocument()

    expect(maskPhoneMock).toHaveBeenCalledWith('11999999999')
    expect(screen.getByText('PHONE:11999999999')).toBeInTheDocument()

    expect(screen.getByText('nodeModal.caseNumber')).toBeInTheDocument()
    expect(screen.getByText('CASE-42')).toBeInTheDocument()

    const filesLabel = screen.getByText('nodeModal.files')
    const filesContainer = filesLabel.parentElement as HTMLElement
    expect(filesContainer).toBeInTheDocument()
    const rows = within(filesContainer).getAllByText(/fileA\.pdf|fileB\.txt/)
    expect(rows).toHaveLength(2)

    const closeBtn = screen.getByLabelText('nodeModal.close') // aria-label is the key (mocked t)
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders a relationship node (isRelationship=true) with sourceDatabase, optional caseNumber, files and quantity', () => {
    render(
      <NodeModal
        isOpen
        onClose={() => {}}
        name="Rel name"
        isRelationship
        sourceDatabase="SIMBA"
        caseNumber="PROC-99"
        quantity={3}
        cpfCnpj="IGNORED_FOR_REL" 
        files={['A.doc', 'B.doc', 'C.doc']}
      />
    )

    expect(screen.getByText('REL NAME')).toBeInTheDocument()

    expect(screen.getByText('nodeModal.sourceDatabase')).toBeInTheDocument()
    expect(screen.getByText('SIMBA')).toBeInTheDocument()

    expect(screen.getByText('nodeModal.caseNumber')).toBeInTheDocument()
    expect(screen.getByText('PROC-99')).toBeInTheDocument()

    expect(screen.getByText('nodeModal.files')).toBeInTheDocument()
    expect(screen.getAllByText(/\.doc$/)).toHaveLength(3)

    expect(screen.getByText('nodeModal.quantity')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()

    expect(screen.queryByText(/nodeModal.cpfCnpj/)).not.toBeInTheDocument()
    expect(screen.queryByText(/nodeModal.phone/)).not.toBeInTheDocument()
  })

  it('relationship node renders N/A when sourceDatabase is not provided', () => {
    render(
      <NodeModal
        isOpen
        onClose={() => {}}
        name="Rel"
        isRelationship
      />
    )

    expect(screen.getByText('nodeModal.sourceDatabase')).toBeInTheDocument()
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('does not render files section when files is empty or undefined', () => {
    const { rerender } = render(
      <NodeModal
        isOpen
        onClose={() => {}}
        name="No files"
        cpfCnpj="111"
        files={[]}
      />
    )
    expect(screen.queryByText('nodeModal.files')).not.toBeInTheDocument()

    rerender(
      <NodeModal
        isOpen
        onClose={() => {}}
        name="No files again"
        cpfCnpj="222"
      />
    )
    expect(screen.queryByText('nodeModal.files')).not.toBeInTheDocument()
  })

  it('omits cpf/cnpj and phone sections if those props are missing', () => {
    render(
      <NodeModal
        isOpen
        onClose={() => {}}
        name="Minimal"
      />
    )
    expect(screen.queryByText('nodeModal.cpfCnpj')).not.toBeInTheDocument()
    expect(screen.queryByText('nodeModal.phone')).not.toBeInTheDocument()
  })

  it('uses fallback modal title when name is empty string', () => {
    render(
      <NodeModal
        isOpen
        onClose={() => {}}
        name=""
        cpfCnpj="123"
      />
    )
    expect(screen.getByText('ELEMENTO SELECIONADO')).toBeInTheDocument()
  })

  it('renders quantity for non-relationship path only when provided', () => {
    const { rerender } = render(
      <NodeModal
        isOpen
        onClose={() => {}}
        name="Q1"
        cpfCnpj="123"
        quantity={7}
      />
    )
    expect(screen.getByText('nodeModal.quantity')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()

    rerender(
      <NodeModal
        isOpen
        onClose={() => {}}
        name="Q2"
        cpfCnpj="123"
      />
    )
    expect(screen.queryByText('nodeModal.quantity')).not.toBeInTheDocument()
  })

  it('renders caseNumber on non-relationship path when provided', () => {
    render(
      <NodeModal
        isOpen
        onClose={() => {}}
        name="Case"
        cpfCnpj="123"
        caseNumber="CASE-777"
      />
    )
    expect(screen.getByText('nodeModal.caseNumber')).toBeInTheDocument()
    expect(screen.getByText('CASE-777')).toBeInTheDocument()
  })
})
