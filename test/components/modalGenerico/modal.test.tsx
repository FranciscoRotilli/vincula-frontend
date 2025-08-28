import Modal from '@/components/modalGenerico/Modal';
import { render, screen, fireEvent } from '@testing-library/react';

// Descreve a suíte de testes para o componente Modal
describe('Componente: Modal', () => {

    // Grupo de testes para a renderização básica do componente
    describe('Renderização', () => {
        it('não deve renderizar quando a prop "isOpen" for false', () => {
            render(<Modal isOpen={false} onClose={() => {}}><div>Conteúdo</div></Modal>);
            // queryByRole é usado pois esperamos que o elemento não seja encontrado
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        it('deve renderizar quando a prop "isOpen" for true', () => {
            render(<Modal isOpen={true} onClose={() => {}}><div>Conteúdo</div></Modal>);
            // getByRole é usado pois esperamos que o elemento SEJA encontrado
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        it('deve exibir o título e o conteúdo (children) corretamente', () => {
            const modalTitle = 'Título do Meu Modal';
            const modalContent = 'Este é o conteúdo interno.';

            render(
                <Modal isOpen={true} onClose={() => {}} title={modalTitle}>
                    <p>{modalContent}</p>
                </Modal>
            );

            expect(screen.getByText(modalTitle)).toBeInTheDocument();
            expect(screen.getByText(modalContent)).toBeInTheDocument();
        });
    });

    // Grupo de testes para as interações do usuário
    describe('Interações de Usuário', () => {
        it('deve chamar a função "onClose" ao clicar no botão de fechar (×)', () => {
            const onCloseMock = vi.fn();
            render(<Modal isOpen={true} onClose={onCloseMock} title="Teste"><div></div></Modal>);

            fireEvent.click(screen.getByRole('button', { name: /×/i }));
            expect(onCloseMock).toHaveBeenCalledTimes(1);
        });

        it('deve chamar a função "onClose" ao clicar no botão "Cancelar"', () => {
            const onCloseMock = vi.fn();
            render(<Modal isOpen={true} onClose={onCloseMock}><div></div></Modal>);

            fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
            expect(onCloseMock).toHaveBeenCalledTimes(1);
        });

        it('deve chamar a função "onAdd" ao clicar no botão "Adicionar"', () => {
            const onAddMock = vi.fn();
            render(<Modal isOpen={true} onClose={() => {}} onAdd={onAddMock}><div></div></Modal>);

            fireEvent.click(screen.getByRole('button', { name: /adicionar/i }));
            expect(onAddMock).toHaveBeenCalledTimes(1);
        });

        it('deve chamar "onClose" ao clicar no overlay', () => {
            const onCloseMock = vi.fn();
            render(<Modal isOpen={true} onClose={onCloseMock}><div></div></Modal>);

            fireEvent.click(screen.getByTestId('overlay'));
            expect(onCloseMock).toHaveBeenCalledTimes(1);
        });

        it('NÃO deve chamar "onClose" ao clicar dentro do conteúdo do modal', () => {
            const onCloseMock = vi.fn();
            render(<Modal isOpen={true} onClose={onCloseMock}><div></div></Modal>);

            fireEvent.click(screen.getByTestId('modal-container'));
            expect(onCloseMock).not.toHaveBeenCalled();
        });
    });

    // Grupo de testes para o comportamento das props
    describe('Comportamento das Props', () => {
        it('NÃO deve fechar ao clicar no overlay quando "closeOnOverlayClick" for false', () => {
            const onCloseMock = vi.fn();
            render(<Modal isOpen={true} onClose={onCloseMock} closeOnOverlayClick={false}><div></div></Modal>);

            fireEvent.click(screen.getByTestId('overlay'));
            expect(onCloseMock).not.toHaveBeenCalled();
        });

        // Teste parametrizado para todos os tamanhos
        it.each(['small', 'medium', 'large', 'fullscreen'])('deve aplicar a classe de tamanho "%s"', (size) => {
        const testSize = size as 'small' | 'medium' | 'large' | 'fullscreen';
        render(<Modal isOpen={true} onClose={() => {}} size={testSize}><div></div></Modal>);
        
        const container = screen.getByTestId('modal-container');
        
        expect(container.className).toContain(testSize);
    });
    });

    // Grupo de testes para acessibilidade (a11y)
    describe('Acessibilidade', () => {
        it('deve ter o role="dialog" e o atributo aria-modal="true"', () => {
            render(<Modal isOpen={true} onClose={() => {}}><div></div></Modal>);
            const modal = screen.getByRole('dialog');
            
            expect(modal).toBeInTheDocument();
            expect(modal).toHaveAttribute('aria-modal', 'true');
        });

        it('deve associar o título ao modal com "aria-labelledby"', () => {
            const modalTitle = 'Modal Acessível';
            render(<Modal isOpen={true} onClose={() => {}} title={modalTitle}><div></div></Modal>);

            const modal = screen.getByRole('dialog');
            const titleElement = screen.getByText(modalTitle);

            expect(modal).toHaveAttribute('aria-labelledby', titleElement.id);
        });
    });
});