# Prompt para a equipe do backend — Fórum CTI

Copie o texto abaixo e envie junto com o PDF **Sistema Governança Fórum CTI.pdf**. O frontend já contém telas consumidoras do contrato proposto abaixo; os endpoints novos ainda precisam ser implementados e homologados. Não afirmar que o módulo está pronto apenas porque a tela existe.

---

Precisamos adaptar o backend do Fórum CTI aos requisitos da professora, preservando os endpoints legados utilizados pelo frontend Vite/React. Implementem migrações, validações, autorização, persistência, auditoria e testes. Não usem dados simulados em produção.

## 1. Compatibilidade e formato comum

- Preservar `/api/sessao`, `/api/dominios`, `/api/instituicoes`, `/api/representantes`, `/api/vinculos`, `/api/reunioes`, `/api/indicadores` e recuperação de senha.
- Os recursos novos abaixo usam **`/api/governanca`** como prefixo. Todas as respostas de sucesso JSON devem conter **`versao: 1`**. É a versão do contrato, não a revisão de um registro.
- Não retornar HTML, corpo vazio ou 204 nas operações novas: o frontend verifica a confirmação do servidor antes de anunciar sucesso.
- Erros: status HTTP apropriado + `{ "erro": { "codigo": "CODIGO", "mensagem": "Mensagem para a pessoa usuária", "campos": [{ "campo": "campo", "mensagem": "Correção necessária" }] } }`.
- 401 para sessão ausente; 403 para operação proibida; 404 para registro/serviço inexistente; 409 para duplicidade, concorrência ou transição inválida; 422 para validação. Evitar 401 em consultas públicas que aceitam visitantes.
- IDs opacos em strings. Datas civis `YYYY-MM-DD`; horas `HH:mm`; timestamps com fuso ISO 8601. Os formulários de credenciamento enviam horário local sem offset: interpretar explicitamente em `America/Sao_Paulo` e devolver timestamps com offset.
- Listas novas usam `{ "versao": 1, "dados": [...] }`. Nesta primeira integração o frontend filtra a lista recebida: devolver o conjunto autorizado completo, sem truncamento silencioso. Antes de introduzir paginação, alinhar contrato e controles de página com o frontend.
- Campos opcionais podem ser `null`; o frontend também envia `""` para limpar um campo. Validar e normalizar sem descartar silenciosamente novos campos. Valores booleanos e numéricos devem manter seus tipos.
- URLs de arquivos, QR, inscrição e relatórios devem ser absolutas HTTP(S), preferencialmente HTTPS. Nunca devolver caminhos locais do servidor.
- Referências exatas dos campos: `src/features/governance/schemas.js`; operações consumidoras: `src/features/governance/*.jsx` e `src/api/governanca.js`.

## 2. Sessão, perfis e escopo

Manter cookie HttpOnly com expiração, revogação no logout, Secure em produção, SameSite adequado ao frontend na Vercel e à API; CORS com origem exata e credentials. Proteger mutações contra CSRF conforme a estratégia do projeto. A falha no logout agora mantém a interface autenticada e informa erro; 401 ao sair significa sessão já encerrada.

`GET/POST /api/sessao` deve devolver o usuário autenticado, incluindo:

```json
{
  "id": "usuario-id",
  "nome": "Nome da pessoa",
  "papel": "representante_instituicao",
  "rotuloPapel": "Representante da instituição",
  "instituicaoId": "instituicao-id",
  "pessoaId": "pessoa-id",
  "menu": [{"href":"/minha-instituicao","rotulo":"Minha instituição"}]
}
```

Papéis novos: `admin_geral`, `diretoria`, `representante_instituicao`; público é acesso sem sessão. O frontend mantém compatibilidade com `administrador`/`admin`, `gestor` e `leitura`. **Não converter leitura automaticamente em representante sem vínculo institucional válido.** Migrar contas existentes de forma explícita, alinhada com os responsáveis.

- Admin geral: gestão global; exclusão definitiva só com confirmação e regras de integridade.
- Diretoria: reuniões/eventos/presenças, representantes, documentos, aprovação de entrada e alterações institucionais. Não permitir exclusão definitiva nem edição direta irrestrita de instituições.
- Representante: apenas sua instituição, seus documentos, suas solicitações, participação e relatórios institucionais. Não retornar listas nominais de outras instituições nem CPF de terceiros. A identidade institucional deve vir da sessão, nunca de um ID fornecido pelo cliente.
- Público: somente projeções aprovadas para divulgação. Não utilizar endpoints privados como fonte de resposta pública sem projeção explícita dos campos permitidos.
- Validar acesso por recurso e objeto em cada endpoint; esconder botões não é autorização.
- Gestão de contas/permissões deve existir no backend apenas para admin. A tela administrativa de contas ainda não foi construída nesta entrega: definir posteriormente CRUD, convite, ativação, recuperação e alteração auditada de papel/vínculo.

## 3. Dashboard público

`GET /api/governanca/publico` — sem exigir login:

```json
{
  "versao": 1,
  "indicadores": {"instituicoes":12,"reunioes":8,"eventos":4,"participacao":75.5},
  "instituicoes": [{"id":"i1","nome":"Instituição","logoUrl":"https://.../logo.png","tipo":"Ensino","vertente":"Educação","area":"Tecnologia","autorizaDivulgacao":true}],
  "diretoria": [{"id":"d1","nome":"Nome público autorizado","cargo":"Presidência","instituicao":"Instituição"}],
  "calendario": [{"id":"e1","tipo":"evento","titulo":"Workshop","data":"2026-11-01","local":"Auditório","inscricaoUrl":"https://..."}],
  "documentos": [{"titulo":"Regimento","url":"https://..."}],
  "canais": [{"titulo":"Canal oficial","url":"https://..."}],
  "interesseUrl": "https://..."
}
```

Retornar apenas instituições/logos autorizados e documentos/atividades publicados. O filtro de autorização no frontend é complementar: o servidor não deve enviar o restante. Indicador desconhecido deve ser `null`, não zero. Calendário unificado combina reuniões e eventos públicos. Não incluir telefones pessoais, e-mails privados, CPFs ou listas de presença nessa resposta.

## 4. Governança dos cadastros existentes

`GET/PATCH /api/governanca/{instituicoes|representantes|reunioes}/:id/governanca`

- GET: `{ "versao": 1, "registro": { ...campos } }`.
- PATCH: corpo com campos do registro; resposta com o registro efetivamente persistido no mesmo envelope.
- Não substituir os formulários legados; estes endpoints complementam os registros existentes. Instituições: PATCH somente admin geral; Diretoria usa aprovação.

Campos de instituição (tipos em `institutionSchema`):

`nomeFantasia`, `razaoSocial`, `cnpj`, `telefone`, `email`, `endereco` (texto completo), `vertente`, `gts` (texto separado por vírgula), `dataIngresso`, `situacaoAdesao`, `contatosComunicacao` (texto), `redesSociais` (texto), `autorizaDivulgacao` (boolean), `titular`, `suplente` (nomes propostos), `motivoSaida`, `dataSaida`.

Situação da adesão: `rascunho`, `aguardando_documentos`, `em_analise`, `ajustes_solicitados`, `aprovada`, `inativa`, `desligada`. Distinguir adesão do status legado. Transições devem ser validadas; aprovação de adesão ativa a instituição de modo transacional.

Titular/suplente informados como texto são propostas de indicação, não substituem automaticamente vínculos por homonímia. Resolver pessoa e vínculo formal na aprovação, garantindo no máximo um titular e um suplente ativos conforme regra validada com o Fórum. Não recriar uma pessoa com base apenas em nome.

Representante (`representativeSchema`): `tipo` = `titular|suplente|adicional|convidado`, `cargoForum`, `vertente`, `gts`, `inicio`, `fim`, `motivoSubstituicao`, `oficioId`, `usuarioId`, `autorizaComunicacoes`. Manter cargo na instituição e histórico de vínculos existentes. Rejeitar intervalo invertido, ofício não autorizado ou usuário incompatível.

Reunião (`meetingSchema`): `tipo` = `ordinaria|extraordinaria|diretoria|gt`, `numero`, `modalidade` = `presencial|online|hibrida`, `organizador`, `publicoAlvo`, `instituicoesConvocadas` (IDs separados por vírgula), `limiteParticipantes`, `status` = `rascunho|publicada|em_andamento|encerrada|cancelada`, `pauta`, `ata`, `encaminhamentos` (texto com responsáveis/prazos), `contaParticipacao` (boolean).

O formulário legado de reunião também passou a expor `horaFim` e `endereco`, já presentes no mapeamento da API. Validar fim posterior ao início. Os status novos precisam ser compatibilizados no retorno legado (`publicada` ↔ `agendada`, quando aplicável), sem perder o estado real de governança.

## 5. Área institucional e aprovação

`GET /api/governanca/minha-instituicao`:

```json
{
  "versao":1,
  "instituicao":{"id":"i1","nomeFantasia":"Instituição","razaoSocial":"Razão social","cnpj":"12345678000100"},
  "participacao":{"percentual":75,"descricao":"3 de 4 atividades elegíveis","atividades":[{"id":"r1","tipo":"reuniao","data":"2026-10-10","titulo":"Reunião","status":"presente"}]},
  "solicitacoes":[{"id":"s1","tipo":"alteracao_cadastral","status":"pendente","criadoEm":"2026-10-10T12:00:00Z","parecer":null}]
}
```

`instituicao` contém os campos do schema institucional. O servidor seleciona a instituição da sessão. Representante sem vínculo recebe erro explícito, nunca a primeira instituição do banco.

`POST /minha-instituicao/solicitacoes`:

```json
{"tipo":"alteracao_cadastral","alteracoes":{"telefone":"42999999999"},"justificativa":"Atualização do contato"}
```

Resposta `{ "versao":1, "solicitacao":{"id":"s1","status":"pendente"} }`. Criar solicitação sem atualizar imediatamente o cadastro. Na primeira versão, o frontend encaminha todas as mudanças da área institucional à análise. Nome/CNPJ, titular/suplente, ofício, entrada/saída sempre exigem aprovação.

`GET /solicitacoes` (admin/Diretoria): `{ "versao":1, "dados":[{"id":"s1","instituicaoNome":"Instituição","tipo":"alteracao_cadastral","status":"pendente","justificativa":"...","alteracoes":{"telefone":"..."},"versaoRegistro":3}] }`.

`POST /solicitacoes/:id/decisao`: `{ "decisao":"aprovar|rejeitar", "parecer":"...", "versaoRegistro":3 }` → `{ "versao":1,"solicitacao":{"id":"s1","status":"aprovada|ajustes_solicitados"} }`.

Usar transação e controle de concorrência, impedir dupla decisão e registrar autor/data/antes/depois/parecer. Ao aprovar, aplicar apenas campos permitidos ao registro correto; não aceitar mass assignment. Ao rejeitar, preservar os dados oficiais.

## 6. Eventos separados de reuniões

- `GET /eventos/configuracao` → `{ "versao":1 }`, apenas para usuários autorizados a criar; sinaliza disponibilidade do formulário.
- `GET /eventos` → `{ "versao":1, "dados":[{...evento}] }`.
- `POST /eventos` → `{ "versao":1, "evento":{...registroPersistidoComId} }`.
- `GET/PATCH /eventos/:id` → mesmo envelope `evento`.

Corpo conforme `eventSchema`: `titulo`, `categoria` = `workshop|missao_tecnica|palestra|evento_parceiro|calendario_unificado`, `data`, `horaInicio`, `horaFim`, `modalidade`, `local`, `endereco`, `linkTransmissao`, `organizacao`, `origem` = `proprio|parceiro`, `inscricaoExterna`, `imagemUrl`, `publicoAlvo`, `limiteParticipantes`, `status` = `rascunho|publicada|em_andamento|encerrada|cancelada`, `descricao`, `pauta`, `encaminhamentos`, `exibirCalendario`, `contaParticipacao`.

Reunião e evento são entidades distintas, mesmo compartilhando serviço de participantes e credenciamento. Preservar identidade/tipo em relatórios. Não renomear todas as reuniões para eventos nem misturar IDs sem discriminador.

## 7. Documentos e logo

Scopes utilizados: `minha-instituicao`, `instituicoes/:id`, `reunioes/:id`, `eventos/:id`.

- `GET /{scope}/documentos` → `{ "versao":1, "podeEnviar":true, "dados":[{"id":"d1","nome":"Ofício.pdf","tipo":"oficio","versaoArquivo":1,"status":"em_analise","downloadUrl":"https://..."}] }`.
- `POST /{scope}/documentos`: multipart/form-data com `arquivo` binário e `tipo` string. Resposta `{ "versao":1, "documento":{"id":"d1","status":"em_analise"} }`.
- Tipos da interface: `logo`, `oficio`, `termo_adesao`, `convocacao`, `ata`, `foto`, `material`, `evidencia`. Validar tipo compatível com o scope no servidor.
- Nesta versão: PDF, PNG e JPEG até 10 MB; logo somente PNG/JPEG. Validar conteúdo real e limites no servidor, não confiar em MIME/nome fornecidos. Não aceitar SVG executável. Manter versões e vínculo ao dono.
- `podeEnviar` deve refletir permissão real; também validar POST. Download privado via URL temporária autorizada ou equivalente, nunca bucket público para ofícios/dados pessoais.
- Upload de logo/ofício por representante deve gerar análise quando necessário, sem substituir imediatamente documento oficial. Logos públicas só após autorização e aprovação.

## 8. Credenciamento, QR e presenças

Scopes: `reunioes/:id` e `eventos/:id`.

`GET /{scope}/credenciamento`:

```json
{"versao":1,"status":"aberto","inicio":"2026-11-01T09:00:00-03:00","fim":"2026-11-01T12:00:00-03:00","qrCodeUrl":"https://.../qr.png","checkinUrl":"https://centro-inovacao.vercel.app/checkin/TOKEN_OPACO","percentual":75,"participantes":[{"id":"p1","nome":"Participante","instituicao":"Instituição","tipo":"representante","statusPresenca":"presente","horarioCheckin":"2026-11-01T10:00:00-03:00"}]}
```

- `POST /{scope}/credenciamento/abrir` com `{ "inicio":"2026-11-01T09:00", "fim":"2026-11-01T12:00", "permiteConvidados":true }`.
- `POST /{scope}/credenciamento/encerrar` com `{}`.
- Ambas respondem `{ "versao":1, "confirmado":true }` só após persistência. Somente admin/Diretoria.
- Gerar QR real no servidor codificando `checkinUrl`, com token imprevisível, validade e revogação. A imagem deve ser PNG e acessível por URL apropriada. Nunca construir token de presença apenas com o ID da atividade.
- `POST /{scope}/presencas` para inclusão/correção manual: `{ "pessoaId":"p1", "instituicaoId":"i1", "tipo":"representante|convidado|equipe", "statusPresenca":"presente|ausente|justificada", "modalidade":"presencial|online", "justificativa":"Motivo obrigatório" }` → `{ "versao":1, "confirmado":true }`.
- A resposta do credenciamento deve incluir `pessoas: [{id,nome}]` e `instituicoes: [{id,nome}]` autorizadas para alimentar os seletores da inclusão manual. A interface envia os IDs selecionados; o backend valida existência e vínculo.
- Preservar restrição de unicidade por pessoa/atividade; correção atualiza registro e acrescenta evento de auditoria, não cria duplicata. Registrar quem corrigiu, instante, valor anterior/novo e justificativa. Não aceitar autor/timestamp de auditoria do cliente.

## 9. Check-in público

`GET /checkin/:token` (aceita visitante ou sessão):

```json
{"versao":1,"aberto":true,"permiteConvidados":true,"atividade":{"titulo":"Workshop","data":"2026-11-01","local":"Auditório"},"participante":{"nome":"Nome da sessão","email":"email autorizado","instituicaoId":"i1","tipo":"representante"},"instituicoes":[{"id":"i1","nome":"Instituição"}]}
```

`participante` é `null` sem sessão. Para logados, devolver somente instituições que a pessoa pode representar. Para convidados, devolver somente as opções públicas autorizadas. Não expor cadastro nominal completo.

`POST /checkin/:token`: `{ "nome":"...", "email":"...", "instituicaoId":"i1", "tipo":"convidado", "modalidade":"presencial", "assinatura":"Nome completo" }`.

Resposta `{ "versao":1, "presenca":{"id":"p1","horarioCheckin":"2026-11-01T10:00:00-03:00"} }`.

O servidor determina identidade e tipo efetivo a partir da sessão/vínculo; não permitir que visitante se autodeclare representante oficial ou equipe. Nome/e-mail do corpo só valem para convidado quando permitido. Validar token, janela, atividade cancelada, limite e duplicidade no momento da gravação, com transação. Para presença já registrada, retornar 409 com mensagem clara (ou alinhar resposta idempotente equivalente). Limitar abuso e requisições. A assinatura digitada é declaração simples de presença, não certificado digital qualificado.

O frontend tem tela de janela fechada, confirmação, erro e retorno ao check-in após login. Não há fila offline de gravações nesta entrega; o procedimento manual offline precisa ser definido e implementado posteriormente para não perder dados nem produzir confirmações falsas.

## 10. Participação e relatórios

`POST /{scope}/relatorios`, scopes `minha-instituicao`, `reunioes/:id`, `eventos/:id`:

```json
{"inicio":"2026-01-01","fim":"2026-12-31","formato":"xlsx"}
```

Resposta `{ "versao":1,"downloadUrl":"https://.../relatorio.xlsx" }`. Aceitar `xlsx|pdf`; gerar arquivo real, não CSV renomeado. Autorizar download, limitar validade, aplicar período inclusivo e escopo da sessão. Escapar fórmulas e conteúdo não confiável na planilha.

O frontend já exporta localmente CSV e PDF pela impressão dos dados efetivamente filtrados da lista de presença legada. Isso não substitui relatório oficial nem XLSX do backend.

Definir com o Fórum a regra oficial antes de consolidar indicadores: atividades elegíveis, convocação, período ativo da instituição, presença titular/suplente, convidados/equipe, justificativas, eventos que contam ou não. Proposta para validação: instituição conta no máximo uma vez por atividade elegível, denominador = atividades para as quais era elegível/convocada no período; denominador zero → `null`. Não dividir simplesmente pessoas presentes pelo total de instituições. Aplicar a mesma regra no dashboard, área institucional, PDFs e Excel; disponibilizar descrição do numerador/denominador.

## 11. Segurança, migração e critérios de entrega

- Migrações preservam históricos; preferir inativação/arquivamento. Backup e recuperação devem ser testados.
- Auditoria no servidor para cadastro, status, aprovação, documentos, vínculos, credenciamento e correções. Controle de versão dos documentos.
- Separar observações internas dos dados visíveis ao representante/público; esse campo e a tela de auditoria completa ainda precisam de UI específica.
- Implementar e testar proibição de acesso cruzado por ID, tentativa de alterar próprio papel, aprovação concorrente, check-in simultâneo duplicado, QR expirado/encerrado, upload incompatível, download não autorizado e ocultação de dados pessoais na API pública.
- Testar sessão após F5, expiração, logout, falha de rede e CORS no domínio real da Vercel.
- Testes do frontend usam API simulada: não são prova de persistência/autorização do backend. Homologar os fluxos integrados antes de declarar conclusão.
- Entregar documentação OpenAPI, migrações, testes, exemplos reais sem segredos e relação de variáveis de ambiente.
- Recursos ainda fora desta entrega de interface: gestão de contas, importação em lote, notificações reais, convocações/RSVP completos, correção solicitada pelo representante, histórico detalhado de auditoria, fila offline e encaminhamentos estruturados. Planejar contratos sem afirmar que o frontend já consome essas operações.

Implementem primeiro sessão/perfis e escopo institucional; depois cadastros/aprovação/documentos; eventos/credenciamento; dashboard e relatórios. Se algum contrato precisar mudar, alinhem com o frontend antes de publicar. Não retornar sucesso para operações ainda não implementadas.
