# Integração com o back-end

Os cadastros e indicadores vêm da API. Apenas a preferência de lembrar o e-mail usa armazenamento local.

## Como rodar

```bash
npm install
npm run dev
```

Por padrão o front procura a API em `http://localhost:3000`. Para usar a API
que já está no ar, crie um arquivo `.env.local`:

```
VITE_API_URL=https://backendci-production.up.railway.app
```

Em produção o valor já está em `.env.production`, então o build do Vercel
funciona sem configurar nada.

### Contas para testar

A senha das três é `senha123456`:

| E-mail | Papel | O que consegue fazer |
| --- | --- | --- |
| `ana@centroinovacao.br` | Administrador | Tudo |
| `carla@centroinovacao.br` | Gestor | Cadastra e edita |
| `bruno@centroinovacao.br` | Leitura | Só consulta |

Entrar com o `bruno` é o jeito rápido de ver as mensagens de permissão.

## Como está organizado

```
src/api/
├── cliente.js            fetch com cookie, tratamento de erro, ErroDaApi
├── recursos.js           uma função por operação (listar, criar, editar...)
├── mapas.js              tradução entre os nomes das telas e os da API
├── dominios.jsx          carrega as listas dos selects
├── dominios-contexto.js  o hook useDominios
└── useColecao.js         hook de lista, substituiu o useLocalCollection
```

A regra é: **os componentes não conhecem a API**. Eles continuam recebendo
objetos no mesmo formato de antes (`name`, `cnpj`, `city`...), e `mapas.js`
faz a tradução nos dois sentidos. Se um nome de campo mudar no back, muda só
ali.

## Três coisas que não são óbvias

### 1. Os selects não são mais listas fixas

Tipo de instituição e área de atuação vêm de `GET /api/dominios`. A API guarda
um **número** (`tipoInstituicaoId`), não o texto. Por isso os nomes precisam
bater exatamente com os do banco — a lista antiga tinha "Instituto de Pesquisa"
e o banco tem "Instituto de pesquisa".

Não volte a escrever essas opções na mão: cadastrar um tipo novo no banco passa
a aparecer na tela sozinho.

### 2. O login usa cookie, não token

A API devolve um cookie `HttpOnly`. O JavaScript não consegue lê-lo, e é assim
mesmo — é o que protege contra roubo de sessão. Por isso todo `fetch` precisa de
`credentials: 'include'`, que já está no `cliente.js`.

Consequência prática: a sessão sobrevive ao F5. Ao abrir o app, o `App.jsx`
chama `GET /api/sessao` pra saber se já tem alguém logado.

### 3. `localhost` e `127.0.0.1` são origens diferentes

A API só libera as origens que estão na variável `URL_FRONTEND`. Hoje são
`https://centro-inovacao.vercel.app` e `http://localhost:5173`.

Se você abrir `http://127.0.0.1:5173` o navegador bloqueia por CORS, mesmo
sendo a mesma máquina. Use `localhost`.

## Erros de formulário

Quando o servidor recusa, ele diz qual campo e por quê:

```json
{
  "erro": {
    "codigo": "DADOS_INVALIDOS",
    "mensagem": "CNPJ inválido. Confira os números digitados.",
    "campos": [{ "campo": "cnpj", "mensagem": "CNPJ inválido. Confira os números digitados." }]
  }
}
```

O `ErroDaApi.porCampo()` transforma isso em `{ cnpj: 'CNPJ inválido...' }` e o
formulário pinta a mensagem embaixo do input. As mensagens já vêm em português,
prontas pra mostrar.

## Endpoints usados hoje

| Tela | Chamada |
| --- | --- |
| Login | `POST /api/sessao` |
| Sessão atual | `GET /api/sessao` |
| Sair | `DELETE /api/sessao` |
| Esqueci a senha | `POST /api/senha/recuperar` |
| Selects | `GET /api/dominios` |
| Dashboard | `GET /api/indicadores` |
| Instituições | `GET/POST /api/instituicoes`, `GET/PATCH/DELETE /api/instituicoes/:id` |
| Ativar/desativar | `POST /api/instituicoes/:id/status` |
| Representantes | `GET/POST /api/representantes`, `GET/PATCH /api/representantes/:id` |
| Reuniões | `GET/POST /api/reunioes`, `GET/PATCH /api/reunioes/:id` |

Atenção: trocar status é **POST**, não PATCH.

## Presencas, historicos e vinculos

A consulta de presencas usa `GET /api/reunioes/:id/participantes`, com resposta `{ dados, totais }`. Cada linha informa `pessoaId`, `instituicaoId`, `nome`, `instituicao`, `tipo`, `statusPresenca` e `horarioCheckin`. Os historicos percorrem as reunioes em lotes de ate quatro consultas simultaneas e filtram a pessoa/instituicao. Uma falha e apresentada como erro; nao e convertida em historico vazio.

A consulta real a `GET /api/reunioes/:id/presencas` respondeu 405; a documentacao anterior estava incorreta para esse metodo. Nao foi inferido o contrato de gravacao a partir dessa resposta.

Vinculos: `GET /api/representantes/:id` retorna `vinculos`; criacao usa `POST /api/vinculos` e encerramento usa `POST /api/vinculos/:id/encerrar`. A interface pede confirmacao antes de encerrar.

## Contratos ainda necessarios

- QR Code: geracao, validade, resposta e URL publica de check-in.
- Check-in: consulta publica e corpo de confirmacao, inclusive convidado.
- Documentos: `GET /api/documentos` exige instituicaoId ou reuniaoId. Faltam contrato de upload, resposta de arquivo e download autorizado.
- Senha: endpoint, token, requisitos e formato para concluir a redefinicao.
- Reunioes: exclusao/cancelamento e regras de transicao de status.

A exportacao de relatorios ainda e local, com PDF via impressao e CSV; a implementacao atual nao entrega todos os historicos por tipo/periodo.
