# Centro de Inovação — Guarapuava & Região

Plataforma web moderna e de alto desempenho desenvolvida para gestão do ecossistema, programas de aceleração, instituições e indicadores de inovação do **Centro de Inovação de Guarapuava e Região**.

> **Nota Importante / Em Desenvolvimento**: As telas, fluxos de navegação e componentes visuais atuais foram estruturados com base nos requisitos iniciais da disciplina. **Esta estrutura pode sofrer alterações e refatorações assim que o protótipo oficial for disponibilizado pela Professora Belle.**

---

## Tecnologias Utilizadas

Este projeto foi construído utilizando as melhores práticas do desenvolvimento front-end moderno:

* **[React](https://react.dev/)**: Biblioteca para construção de interfaces de usuário reativas e componentizadas.
* **[Vite](https://vitejs.dev/)**: Build tool de alta velocidade para desenvolvimento rápido.
* **[Tailwind CSS v4](https://tailwindcss.com/)**: Framework CSS utility-first configurado com o plugin `@tailwindcss/vite` para estilização fluida, responsiva e suporte nativo a Dark Mode.

---

## Design System & Estética

O projeto adota uma identidade **Dark / Tech & Glassmorphism**:
* **Fundo Predominante**: `slate-950`
* **Elementos Globais**: Bordas sutis em `slate-800`, efeitos de brilho neon (`blur-3xl`), botões com gradientes vibrantes em Azul e Índigo, além de microinterações fluidas.

---

## Arquitetura do Projeto

O código está estruturado no modelo **Feature-Driven (orientado por funcionalidades)**, visando escalabilidade e facilidade de manutenção:

```text
src/
├── features/
│   ├── auth/                  # Módulo de Autenticação e Recuperação de Senha
│   │   └── pages/             # Páginas da funcionalidade de Auth
│   ├── dashboard/             # Módulo do Dashboard Analítico
│   ├── instituicoes/          # Cadastro e Gestão de Instituições
│   ├── startups/              # Gestão e Acompanhamento de Startups
│   ├── eventos/               # Agenda e Gestão de Eventos/Ações
│   ├── consultorias/          # Registro e Controle de Consultorias
│   ├── projetos/              # Gestão de Projetos e Indicadores
│   └── relatorios/            # Módulo de Exportação e Relatórios
├── App.jsx                    # Gerenciador de navegação e fluxos principais
└── main.jsx                   # Ponto de entrada do React


Como Rodar o Projeto Localmente
Pré-requisitos
Node.js (versão 18 ou superior)

npm ou yarn

Passo a Passo
Clone o repositório:

Bash
git clone [https://github.com/Rh4yanna/centro-inovacao.git](https://github.com/Rh4yanna/centro-inovacao.git)
Acesse a pasta do projeto:

Bash
cd centro-inovacao
Instale as dependências:

Bash
npm install
Inicie o servidor de desenvolvimento:

Bash
npm run dev
Abra o navegador no endereço exibido no terminal (geralmente http://localhost:5173).