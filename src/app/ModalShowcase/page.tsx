'use client';
import React, { useState } from 'react';

import Modal from '@/components/modalGenerico/Modal';
import modalStyles from '@/components/modalGenerico/Modal.module.css';

import showcaseStyles from './showcase.module.css';

export default function ShowcasePage() {
  const [basicModalOpen, setBasicModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [fullscreenModalOpen, setFullscreenModalOpen] = useState(false);
  const [noOverlayCloseModalOpen, setNoOverlayCloseModalOpen] = useState(false);

  return (
    <div className={showcaseStyles.container}>
      <h1 className={showcaseStyles.title}>
        Demonstração do Modal
      </h1>
      
      <div className={showcaseStyles.buttonGrid}>
        <button className={showcaseStyles.triggerButton} onClick={() => setBasicModalOpen(true)}>
          Modal Básico
        </button>
        <button className={showcaseStyles.triggerButton} onClick={() => setFormModalOpen(true)}>
          Modal com Formulário
        </button>
        <button className={showcaseStyles.triggerButton} onClick={() => setConfirmModalOpen(true)}>
          Modal de Confirmação
        </button>
        <button className={showcaseStyles.triggerButton} onClick={() => setFullscreenModalOpen(true)}>
          Modal Fullscreen
        </button>
        <button className={showcaseStyles.triggerButton} onClick={() => setNoOverlayCloseModalOpen(true)}>
          Modal sem Fechar no Overlay
        </button>
      </div>

      {/* 1. Modal Básico */}
      <Modal
        isOpen={basicModalOpen}
        onClose={() => setBasicModalOpen(false)}
        title="Modal Básico"
        size="medium"
      >
        <p>
          Este é um modal básico com título e conteúdo simples.
          Você pode fechar clicando no X, pressionando ESC ou clicando fora do modal.
        </p>
      </Modal>

      {/* 2. Modal com Formulário */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title="Adicionar Novo Item"
        size="medium"
        actions={
          <>
            <button className={`${modalStyles.button} ${modalStyles.secondary}`} onClick={() => setFormModalOpen(false)}>
              Cancelar
            </button>
            <button className={`${modalStyles.button} ${modalStyles.primary}`} onClick={() => {
              console.log('Formulário enviado!');
              setFormModalOpen(false);
            }}>
              Salvar
            </button>
          </>
        }
      >
        <div className={showcaseStyles.formStack}>
          <label>Nome</label>
          <input className={showcaseStyles.textInput} type="text" placeholder="Digite o nome" />
          <label>Email</label>
          <input className={showcaseStyles.textInput} type="email" placeholder="Digite o email" />
        </div>
      </Modal>

      {/* 3. Modal de Confirmação */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirmar Exclusão"
        size="small"
        actions={
          <>
            <button className={`${modalStyles.button} ${modalStyles.secondary}`} onClick={() => setConfirmModalOpen(false)}>
              Cancelar
            </button>
            <button className={`${modalStyles.button} ${modalStyles.primary}`} onClick={() => {
              console.log('Ação confirmada!');
              setConfirmModalOpen(false);
            }}>
              Confirmar
            </button>
          </>
        }
      >
        <p>
          Tem certeza de que deseja executar esta ação? Esta operação não pode ser desfeita.
        </p>
      </Modal>

      {/* 4. Modal Fullscreen */}
      <Modal
        isOpen={fullscreenModalOpen}
        onClose={() => setFullscreenModalOpen(false)}
        title="Modal Fullscreen"
        size="fullscreen"
        actions={
          <button className={`${modalStyles.button} ${modalStyles.primary}`} onClick={() => setFullscreenModalOpen(false)}>
            Fechar
          </button>
        }
      >
        <div className={showcaseStyles.fullscreenContent}>
          <h2>Conteúdo Expandido</h2>
          <p>
            Este modal ocupa toda a tela e é ideal para conteúdos que precisam de mais espaço,
            como formulários complexos ou visualização de dados detalhados.
          </p>
        </div>
      </Modal>

      {/* 5. Modal que não fecha ao clicar no overlay */}
      <Modal
        isOpen={noOverlayCloseModalOpen}
        onClose={() => setNoOverlayCloseModalOpen(false)}
        title="Modal Protegido"
        size="medium"
        closeOnOverlayClick={false}
        actions={
          <>
            <button className={`${modalStyles.button} ${modalStyles.secondary}`} onClick={() => setNoOverlayCloseModalOpen(false)}>
              Cancelar
            </button>
            <button className={`${modalStyles.button} ${modalStyles.primary}`} onClick={() => setNoOverlayCloseModalOpen(false)}>
              OK
            </button>
          </>
        }
      >
        <p>
          Este modal não fecha ao clicar fora dele. Você deve usar os botões ou a tecla ESC para fechar.
          Isso é útil para modais com informações importantes que não devem ser fechados acidentalmente.
        </p>
      </Modal>
    </div>
  );
}
