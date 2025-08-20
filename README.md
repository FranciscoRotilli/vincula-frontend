# Vincula Frontend 🌐

Este repositório contém o **frontend do projeto Vincula**, desenvolvido em **Next.js** com **React** e **TypeScript**.  
O objetivo é fornecer a interface do usuário para interação com o sistema Vincula.

---

## Pré-requisitos ⚙️

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão recomendada LTS)
- [npm](https://www.npmjs.com/)

---

## Como rodar o projeto ▶️

Clone o repositório e instale as dependências:

```bash
git clone https://tools.ages.pucrs.br/vincula/frontend.git
cd frontend
npm install



## Scripts Disponíveis 🧪

No diretório do projeto, você pode executar os seguintes comandos:

- `npm run dev`  
  Inicia o servidor de desenvolvimento e abre o projeto em `http://localhost:3000`.  
  (Útil para desenvolver e visualizar alterações em tempo real).

- `npm run build`  
  Cria uma versão otimizada do projeto para produção.  
  (Gera os arquivos finais que podem ser publicados no servidor).

- `npm run start`  
  Executa a versão já compilada do projeto em modo de produção.  
  (Simula como o app rodará depois de publicado).

- `npm run lint`  
  Analisa o código e aponta problemas de formatação ou boas práticas.  
  (Ajuda a manter a qualidade e padronização do código).

- `npm run test`  
  Executa os testes automatizados configurados no projeto.  
  (Verifica se as funcionalidades estão funcionando corretamente).


frontend/
├── public/         # Arquivos estáticos (imagens, ícones, etc.)
├── src/            # Código-fonte principal
│   ├── components/ # Componentes reutilizáveis
│   ├── pages/      # Rotas do Next.js
│   ├── styles/     # Estilos globais e módulos CSS
│   └── utils/      # Funções auxiliares
├── package.json    # Configuração de dependências e scripts
└── README.md       # Documentação do projeto

