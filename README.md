# Inovacaoguarapuava

Frontend para instituições, representantes, reuniões e indicadores do Inovacaoguarapuava.

## Tecnologias e execução

- Node.js 22, npm, React 19, Vite 8 e React Router 7.
- Tailwind CSS 4, CSS próprio e ícones Lucide.
- Componentes organizados por funcionalidade; não utiliza Next.js, shadcn/ui ou uma estrutura Atomic Design formal.

```sh
npm ci
npm run dev
npm run lint
npm run build
node --test tests/*.test.mjs
```

O servidor local abre em `http://localhost:5173`. Configure `VITE_API_URL` em `.env.local` para selecionar o backend. A configuração de produção está em `.env.production`. Variáveis com prefixo `VITE_` são públicas no JavaScript: não coloque segredos nelas.

## Organização

- `src/App.jsx`: sessão, rotas públicas/protegidas e navegação.
- `src/auth/`: contexto do usuário e regras de permissão da interface.
- `src/api/`: cliente HTTP, recursos, normalização de dados e listas de domínio.
- `src/features/auth/`: login e solicitação de recuperação de senha.
- `src/features/institutions/`: listagem, formulários, detalhes e componentes compartilhados.
- `src/features/ManagementPages.jsx`: representantes e reuniões.
- `src/features/Dashboard.jsx`: indicadores e gráficos da API.
- `src/App.css` e `src/index.css`: estilos e adaptações responsivas.
- `tests/`: verificações automatizadas.

## Autenticação e permissões

`/login` e `/esqueci-senha` são públicas. Uma sessão ausente redireciona rotas internas para `/login`. O cliente usa cookies de sessão com `credentials: include` e recupera a sessão ao atualizar a página.

O menu é fornecido pela API. Rotas de recursos não concedidos são bloqueadas na interface. O perfil `leitura` consulta os dados; `gestor` acessa formulários de criação/edição; `administrador`/`admin` também vê ações de exclusão. O backend deve validar a autorização em cada requisição: controles visuais não substituem essa validação.

## Dados e aparência

Os cadastros e indicadores são obtidos pela API; não há persistência de cadastros em localStorage. A interface administrativa utiliza fundo claro, cartões e navegação roxa. O painel de autenticação tem apresentação própria.

## Publicação

Site: https://centro-inovacao.vercel.app

A Vercel usa Node 22, `npm run build` e a pasta `dist`. O `vercel.json` direciona rotas internas ao `index.html` para o React Router. A URL da API é incorporada no build; alterações nela exigem nova publicação. O backend deve permitir a origem do frontend e credenciais no CORS.

O deploy via CLI já foi utilizado. A conexão automática entre GitHub e Vercel não foi confirmada; não assuma que todo push publica uma versão.

## Documentação

- [Integração com a API](docs/integracao-api.md)
- [Conferência das telas](docs/conferencia-telas.md)

Os módulos pendentes e limites devem ser conferidos nesses documentos antes da entrega. Build/lint aprovados não equivalem a testes completos dos fluxos no navegador.

## Ajustes do Fórum CTI (outubro/2026)

O frontend contém telas públicas e de governança, eventos, área institucional, aprovações, documentos e credenciamento. Os recursos novos dependem do contrato `/api/governanca` e mostram indisponibilidade enquanto ele não existir. A API legada foi preservada.

- [Prompt completo para a equipe do backend](docs/prompt-backend.md)
- [Contratos complementares: contas, importação, notificações e demais fluxos](docs/contratos-complementares.md)
- [Comparação com os pedidos da professora](docs/ajustes-professora.md)

Novos papéis reconhecidos: `admin_geral`, `diretoria` e `representante_instituicao`. O perfil legado `leitura` continua sendo consulta; não é transformado automaticamente em representante. A API deve garantir todas as restrições de acesso e vínculo institucional.

Em 26/10 foram adicionados: gestão de contas, importação CSV com prévia validada, notificações/preferências, auditoria paginada, observações internas, convocações/RSVP, encaminhamentos, solicitações de substituição e correção de presença, versões de documentos e filtros de vertente/GT/adesão. Todos dependem dos contratos descritos acima. A fila de presenças durante falha de conexão é opcional: requer suporte de idempotência do servidor; usa a aba atual, expira em 24 horas e não substitui backup. Sem sessão, `/` e `/dashboard` levam ao painel público em `/publico`, com o botão "Acessar minha conta" para o login. Representantes consultam Instituições, logos, Reuniões e Eventos sem criar ou editar nesses módulos. O backend aplica o recorte dos dados por instituição.
