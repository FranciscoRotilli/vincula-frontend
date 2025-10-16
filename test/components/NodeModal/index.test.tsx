import { fireEvent,render, screen } from '@testing-library/react';

import NodeModal from '@/components/NodeModal';

describe('NodeModal', () => {
  it('should not render when isOpen is false', () => {
    render(
      <NodeModal
        isOpen={false}
        name="Teste"
        quantity={10}
        cpfCnpj="000.000.000-00"
      />
    );
    expect(screen.queryByText('Teste')).not.toBeInTheDocument();
  });

  it('should render with correct data', () => {
    render(
      <NodeModal
        isOpen={true}
        name="AILSON BARBOSA"
        quantity={49}
        cpfCnpj="000.000.000-00"
        phone="11999999999"
      />
    );
    expect(screen.getByText('AILSON BARBOSA')).toBeInTheDocument();
    expect(screen.getByText(/49/)).toBeInTheDocument();
    expect(screen.getByText(/000.000.000-00/)).toBeInTheDocument();
    expect(screen.getByText(/\(11\) 99999-9999/)).toBeInTheDocument();
  });

  it('should close when close button is clicked', () => {
    const { rerender } = render(
      <NodeModal
      isOpen={true}
      name="AILSON BARBOSA"
      quantity={49}
      cpfCnpj="000.000.000-00"
      phone="11999999999"
      onClose={() =>
        rerender(
        <NodeModal
          isOpen={false}
          name="AILSON BARBOSA"
          quantity={49}
          cpfCnpj="000.000.000-00"
          phone="11999999999"
          onClose={() => {}}
        />
        )
      }
      />
    );
    const closeButton = screen.getByLabelText('Fechar');
    fireEvent.click(closeButton);
    expect(screen.queryByText('AILSON BARBOSA')).not.toBeInTheDocument();
  });
});