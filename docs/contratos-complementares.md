# Contratos complementares do frontend — 26/10/2026

Este documento complementa [o prompt original](prompt-backend.md). As telas abaixo estão implementadas no frontend e testadas com API simulada; isso não confirma implementação do servidor. O trabalho solicitado nesta etapa é exclusivamente no frontend.

Todos os caminhos abaixo têm prefixo **`/api/governanca`**. Respostas JSON de sucesso mantêm `versao: 1`. Erros usam o envelope `erro` já descrito no prompt. **As mutações novas exigem também `confirmado: true` após persistência.** Não retornar esse campo quando apenas ignorou a operação ou não implementou o recurso.

As listas usam `dados: []`, salvo os nomes explicitados. Listas sem paginação precisam conter o conjunto autorizado completo. O frontend não considera um serviço indisponível como uma lista vazia.

## Contas e permissões

Acesso exclusivo de `admin_geral` (aliases legados `administrador`/`admin`). Diretoria, gestor, leitura e representante não acessam essas rotas mesmo que o menu enviado pela API as contenha.

- `GET /contas`: `{versao:1, dados:[{id,nome,email,papel,instituicaoId,instituicaoNome,ativo,versaoRegistro}], instituicoes:[{id,nome}]}`.
- `POST /contas`: `{nome,email,papel,instituicaoId,ativo}`.
- `PATCH /contas/:id`: mesmos campos + `versaoRegistro`.
- Mutações: `{versao:1, confirmado:true, conta:{id,...}}`.

Papéis do formulário: `admin_geral`, `diretoria`, `representante_instituicao`. Instituição obrigatória somente no último perfil; nos demais o frontend envia `null`. Retornar papéis canônicos em `/contas`, mesmo enquanto a sessão ainda usa aliases legados.

Criação registra convite de acesso no servidor, sem enviar senha no corpo nem retornar senha ao frontend. Persistir convite/fila de e-mail de modo consistente; registrar entrega/falha. Exigir e-mail válido e único; validar instituição; rejeitar mudanças incompatíveis. Proibir desativação/rebaixamento do próprio administrador e remoção do último admin ativo também no backend. Não implementar exclusão física como efeito da edição. A interface revisa perfil/vínculo/situação antes de confirmar a gravação.

## Notificações e e-mails

- `GET /notificacoes`: `{versao:1, dados:[{id,titulo,mensagem,criadaEm,lidaEm,destino}], preferencias:{emailConvocacoes,emailSolicitacoes,emailEncaminhamentos}}`.
- `POST /notificacoes/:id/lida`: `{}` → `{versao:1,confirmado:true}`.
- `PATCH /notificacoes/preferencias`: os três booleanos acima → `{versao:1,confirmado:true}`.

Selecionar destinatário pela sessão; somente o dono pode ler ou marcar suas notificações. `destino` é uma rota interna como `/minha-instituicao`, nunca JavaScript, URL externa ou token secreto. O frontend aplica as permissões novamente ao abrir a rota. Preferências são individuais; respeitar consentimento e deduplicar e-mails. Envio e entrega são responsabilidade do servidor; a tela não simula mensagens nem faz envio diretamente por SMTP.

## Importação de instituições e presenças

Acesso exclusivo de administrador. A primeira versão aceita **CSV UTF-8 com separador `;`, até 5 MB**. Há modelos disponíveis na própria tela.

Colunas de instituições: `nomeFantasia;razaoSocial;cnpj;email;telefone;vertente;gts;dataIngresso`.

Colunas de presenças: `atividadeTipo;atividadeId;pessoaId;instituicaoId;statusPresenca;modalidade;horarioCheckin;justificativa`.

- `GET /importacoes`: `{versao:1,dados:[{id,tipo,status,criadaEm,autorNome,importados}]}`.
- `POST /importacoes/validar`: multipart `arquivo` + `tipo` (`instituicoes|presencas`).
- Resposta: `{versao:1,previa:{id,validos,duplicados,erros:[{linha,mensagem}],colunas:[...],amostra:[{coluna:valor,...}]}}`.
- `POST /importacoes/confirmar`: `{previaId}`.
- Resposta: `{versao:1,confirmado:true,importacao:{id,status,importados}}`.

A validação não altera registros oficiais. Associar a prévia ao usuário, ao tipo e ao hash do arquivo; impor validade e limites no servidor. Não confiar no número de linhas apresentado pelo navegador. Validar CNPJ, vínculos, datas, tipos de atividade, duplicidades internas e contra o banco. Exibir todos os erros relevantes e amostra limitada. Não permitir confirmação com erros/duplicidades. Revalidar a prévia no commit, persistir de forma atômica e tornar confirmação idempotente por `previaId`. Retornar 409 para prévia expirada, de outro usuário ou incompatível. Arquivos ficam no servidor temporariamente; aplicar retenção e autorização. A confirmação deve representar o resultado da transação; filas assíncronas exigem alinhamento adicional do contrato antes de serem usadas.

## Auditoria e observações internas

- `GET /auditoria?inicio=YYYY-MM-DD&fim=YYYY-MM-DD&recurso=...&autor=...&cursor=...&limite=25`.
- Resposta: `{versao:1,dados:[{id,criadoEm,autorNome,acao,recurso,recursoNome,justificativa,antes,depois}],proximoCursor:null|"cursor-opaco"}`.
- `autor` é filtro por nome. Datas de início/fim são inclusivas no fuso do Fórum. Recursos: `instituicoes`, `representantes`, `reunioes`, `eventos`, `presencas`, `documentos`, `contas`, `solicitacoes`, `importacoes`.
- `GET /instituicoes/:id/observacoes`: `{versao:1,dados:[{id,texto,autorNome,criadoEm}]}`.
- `POST /instituicoes/:id/observacoes`: `{texto}` → `{versao:1,confirmado:true}`.

Admin/Diretoria podem consultar a auditoria e adicionar observações. O frontend também preserva o perfil legado gestor nesta transição; migrar/alinhar os papéis no servidor. Leitura/representante/público não têm acesso. Datas, autor e dados de auditoria são gerados pelo servidor. Não enviar senhas, tokens, cookies, segredos ou conteúdo bruto de arquivos em `antes/depois`. Não há edição/exclusão do histórico na interface. Observações são anexadas ao histórico, nunca incluídas na projeção pública ou na área do representante.

## Organização de reuniões/eventos

Nos caminhos abaixo `{scope}` é `reunioes/:id` ou `eventos/:id`.

`GET /{scope}/organizacao`:

```json
{
  "versao": 1,
  "instituicoes": [{"id":"i1","nome":"Instituição"}],
  "responsaveis": [{"id":"p1","nome":"Pessoa responsável"}],
  "convocacoes": [{"id":"c1","instituicaoNome":"Instituição","enviadaEm":"2026-10-26T12:00:00-03:00","statusEntrega":"entregue","resposta":"confirmada","representanteNome":"Pessoa"}],
  "encaminhamentos": [{"id":"t1","titulo":"Publicar relatório","descricao":"...","responsavelId":"p1","responsavelNome":"Pessoa","prazo":"2026-12-01","status":"pendente","resultado":"","versaoRegistro":1}]
}
```

### Convocações

- `POST /{scope}/convocacoes`: `{assunto,mensagem,prazoResposta,instituicoes:[ids],chaveOperacao}` → `{versao:1,confirmado:true}`.
- A tela mostra os destinatários e a mensagem antes de confirmar. `chaveOperacao` é UUID da convocação revisada; reutilizado em uma tentativa após falha. Usar como chave de idempotência associada ao usuário/atividade/conteúdo.
- Somente admin/Diretoria; selecionar os endereços de e-mail autorizados a partir dos IDs, não aceitar destinatários externos arbitrários. Validar atividade, instituição, prazo e mensagem. `prazoResposta` é horário civil `datetime-local`, interpretado em `America/Sao_Paulo`.
- Persistir convocação e tarefa de entrega de forma consistente. `confirmado:true` significa convocação registrada; `statusEntrega` distingue `pendente`, `enviada`, `entregue`, `falhou`. Falha de envio não pode ser mostrada como e-mail entregue.

### Encaminhamentos estruturados

- `POST /{scope}/encaminhamentos`: `{titulo,descricao,responsavelId,prazo,status,resultado}`.
- `PATCH /{scope}/encaminhamentos/:id`: mesmos campos + `versaoRegistro`.
- Resposta: `{versao:1,confirmado:true,encaminhamento:{id,...}}`.
- Status: `pendente|em_andamento|concluido|cancelado`. Responsável e prazo são obrigatórios; conclusão/cancelamento exigem resultado/motivo. Validar vínculo, transições e versão, auditar e notificar conforme preferências. Cancelamento preserva histórico. Esses registros complementam o texto legado `encaminhamentos`, não devem sobrescrever pauta/ata.

## Respostas e solicitações da própria instituição

### Convocações e RSVP

- `GET /minha-instituicao/convocacoes`: `{versao:1,dados:[{id,titulo,data,local,mensagem,prazoResposta,resposta,representanteId,justificativa,podeResponder,versaoRegistro}],representantes:[{id,nome}]}`.
- `POST /minha-instituicao/convocacoes/:id/resposta`: `{resposta,representanteId,justificativa,versaoRegistro}` → `{versao:1,confirmado:true}`.
- `resposta = confirmada|recusada`. Confirmação exige representante ativo da instituição da sessão; recusa exige justificativa. Respeitar prazo, atividade cancelada e concorrência no servidor. RSVP não é check-in e não deve contar como presença efetiva.

### Correção de presença / justificativa de ausência

- `GET /minha-instituicao/presencas`: `{versao:1,dados:[{id,atividadeTitulo,data,nome,statusPresenca,modalidade}]}`. `id` identifica uma participação autorizada, inclusive ausência esperada; não retornar pessoas de outras instituições.
- `POST /minha-instituicao/solicitacoes`: `{tipo:"correcao_presenca",presencaId,alteracoes:{statusPresenca,modalidade},justificativa}`.
- Resposta: `{versao:1,confirmado:true,solicitacao:{id,status:"pendente"}}`.
- Estados: `presente|ausente|justificada`; modalidade `presencial|online`. Registrar solicitação, sem modificar presença oficial antes da aprovação. Validar escopo e duplicidade de solicitação pendente.

### Substituição e encerramento de representantes

- `GET /minha-instituicao/representantes`: `{versao:1,dados:[{vinculoId,nome,tipo,inicio,fim,status}],oficios:[{id,nome}]}`. `status` usa `ativo|encerrado`. A lista inclui histórico; os seletores usam apenas vínculos ativos.
- `POST /minha-instituicao/solicitacoes`, corpo de substituição:

```json
{
  "tipo":"substituicao_representante",
  "representanteAnteriorId":"vinculo-id",
  "oficioId":"documento-id",
  "justificativa":"Motivo",
  "novoRepresentante":{"nome":"Nome","email":"email@example.com","telefone":"...","cargo":"Cargo na instituição","tipo":"titular"}
}
```

**`representanteAnteriorId` carrega o ID do vínculo, não o ID da pessoa.** Para `tipo:"encerramento_representante"`, omitir `novoRepresentante`; demais campos permanecem. Resposta `{versao:1,confirmado:true,solicitacao:{id,status:"pendente"}}`. O ofício deve pertencer à própria instituição e ter tipo adequado. Não encerrar vínculo imediatamente nem substituir pessoa por homonímia. Diretoria/admin aprova em transação com validação de titular/suplente, documentação e período de vínculo. Preservar históricos.

### Informações para decidir uma solicitação

Ampliar os itens de `GET /solicitacoes` com:

- `resumo: [{rotulo,valor}]` — nomes da instituição, representante anterior, indicação proposta, atividade etc.; não mostrar apenas IDs ao aprovador.
- `documentos: [{id,nome,downloadUrl}]` — URLs autorizadas dos ofícios/evidências.
- `comparacao: [{rotulo,antes,depois}]` — comparação dos dados oficiais com os propostos.

Manter `alteracoes`, `versaoRegistro`, `status`, `tipo`, `justificativa` e o contrato existente de `/decisao`. A decisão deve aplicar a operação correspondente ao tipo (cadastro, correção, substituição ou encerramento), nunca um patch arbitrário no cadastro da instituição. O novo campo `confirmado` das solicitações é compatível com a tela antiga de alteração cadastral, que continua exigindo `solicitacao.id`.

## Documentos e filtros

- Cada item de `GET /{scope}/documentos` pode incluir `versoes:[{id,versaoArquivo,enviadaEm,autorNome,downloadUrl}]`. A tela mostra o histórico e permite baixar uma versão autorizada. Aplicar autorização também em versões antigas e não disponibilizar documentos privados por URL permanente pública.
- Acrescentar `vertente`, `gts` (array de nomes ou string separada por vírgula) e `situacaoAdesao` aos itens da listagem **legada** `GET /api/instituicoes`. O frontend já normaliza e filtra esses campos; não inventa opções sem dados. Os campos antigos e os nomes dos status existentes continuam compatíveis.

## Presenças guardadas durante falha de conexão

A interface de credenciamento aceita `registroOfflineHabilitado: true` no GET somente quando o backend implementar a idempotência abaixo. O operador precisa ter aberto a atividade antes da falha de conexão. Não é uma PWA que abre do zero sem internet.

- O usuário escolhe explicitamente guardar o formulário de presença manual. Os registros são pendentes, não presenças confirmadas.
- Armazenamento: `sessionStorage`, isolado por ID do usuário; no máximo 50 registros, prazo máximo de 24 horas, sem tokens de sessão ou nomes/e-mails copiados. O payload contém os IDs selecionados, status, modalidade e justificativa fornecida. É apagado ao sair da conta ou fechar a aba; não é backup.
- Ao sincronizar explicitamente, `POST /{scope}/presencas` recebe os campos manuais existentes mais `chaveOperacao` (UUID persistente por registro) e `registradoOfflineEm` (instante informado pelo dispositivo).
- Responder `{versao:1,confirmado:true}` após gravação; uma repetição da mesma chave, mesmo usuário/atividade e mesmo corpo deve confirmar o mesmo resultado sem duplicar. Chave com conteúdo diferente deve ser recusada. Armazenar idempotência no servidor de forma transacional.
- Validar sessão, papel, instituição, atividade, validade da correção e duplicidade no momento da sincronização. `registradoOfflineEm` não é timestamp oficial nem prova de presença; manter hora do servidor e auditoria de quem sincronizou.
- A fila só remove o registro após confirmação. Falha ou resposta sem confirmação preserva o pendente para nova tentativa com a mesma chave. Expiração da sessão interrompe o envio; não sincronizar automaticamente como outro usuário.

## Homologação e limites

Em 26/10/2026, a consulta sem sessão ao endpoint público configurado (`GET /api/governanca/publico`) retornou **401 / NAO_AUTENTICADO**. Isso confirma que a publicação pública ainda precisa de ajuste no backend; não permite inferir o estado de todos os demais endpoints autenticados.

Validar no servidor: acesso por objeto, revogação de sessão/papel, concorrência, auditoria, fila de e-mails, importação atômica, integridade de documentos, deduplicação de presença, indicadores consistentes, retenção, backup e recuperação. Esses comportamentos não podem ser concluídos apenas no repositório do frontend.

A entrada do site permanece `/login` quando não há sessão; a rota pública é `/publico`. Os testes novos não enviaram e-mails reais, não criaram contas nem alteraram cadastros em produção.
