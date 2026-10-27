# Ajustes do Fórum CTI

Fonte: “Sistema Governança Fórum CTI.pdf”, recebido em 10/10/2026. Os itens abaixo são requisitos do produto extraídos do documento, não instruções de execução ou autorização para publicar alterações.

## Situação atual — 26/10/2026

As pendências de interface da entrega anterior foram ampliadas com:

- Contas: criação, edição, ativação/inativação, vínculo e revisão de permissões; somente administrador.
- Notificações consultadas da API, marcação de leitura e preferências de e-mail.
- Importação de instituições/presenças por CSV com validação, prévia, erros por linha e confirmação separada.
- Auditoria com filtros/paginação e observações internas de instituições.
- Convocações com revisão de destinatários, acompanhamento da entrega e respostas da instituição.
- Encaminhamentos estruturados com responsável, prazo, situação e resultado.
- Solicitações de correção de presença, justificativa de ausência, substituição/encerramento de representante e associação de ofício.
- Versões anteriores dos documentos e filtros institucionais por vertente, GT e situação de adesão.
- Presenças pendentes na aba durante falha de conexão, com expiração, isolamento por usuário, descarte e sincronização explícita. Habilitação depende da idempotência do backend.

Os contratos estão em [contratos-complementares.md](contratos-complementares.md). O backend não faz parte deste repositório nem da responsabilidade da usuária. Não considerar o sistema integralmente concluído sem implementar e homologar esses contratos no servidor. Backup, auditoria efetiva, proteção por objeto, cálculo oficial e entrega de e-mails continuam dependendo da equipe responsável.

A consulta pública real em 26/10/2026 respondeu 401; não foram realizadas mutações em produção. As verificações de interface usam API simulada. O diagnóstico abaixo é histórico da primeira leitura do PDF.

## Comparação inicial com o projeto

| Pedido | Situação encontrada | Trabalho necessário |
| --- | --- | --- |
| Sessão | Recuperação por cookie já existe; logout ocultava falhas do servidor | Corrigido o logout para manter a sessão visível e permitir nova tentativa quando houver falha; validar cookies/CORS com backend real |
| Admin geral, Diretoria, representante e público | Regras atuais usam administrador/admin, gestor e leitura; menu vem da API | Definir papéis na sessão, permissões por operação e vínculo institucional no servidor e na interface |
| Área da própria instituição | Não há isolamento por instituição | Backend precisa fornecer instituição vinculada e restringir leitura, gravação, documentos, listas nominais e relatórios |
| Aprovações | Edições são gravadas diretamente | Criar solicitações, análise, aprovação/rejeição e histórico; alterações sensíveis só entram em vigor após aprovação |
| Instituições | Cadastro básico existente | Acrescentar nome fantasia/razão social, vertente, GTs, ingresso, adesão, contatos, redes, autorização pública e motivo/data de saída; distinguir status de adesão do status atual |
| Logo e documentos | Contratos de upload/download não disponíveis neste projeto | Confirmar armazenamento, limites, autorização, versões e associação de ofício/termo/logo |
| Titular e suplente | Há representantes e vínculos genéricos | Tipos de representação, cargos, início/fim, motivo, ofício, consentimento e usuário vinculado |
| Eventos | Só há reuniões | Recurso próprio com organização, categoria, inscrição externa, divulgação e calendário; não tratar evento como simples rótulo de reunião |
| Reuniões | Cadastro básico existente | Número/tipo, modalidade, horário final, convocação, pauta, ata, anexos, encaminhamentos, responsáveis/prazos e regra de participação oficial |
| Presenças | Consulta, filtros e histórico já implementados | Incluir/corrigir presença, justificativa, modalidade, auditoria, confirmação e fechamento |
| QR Code | Contrato pendente | Token exclusivo, janela de validade, abertura/encerramento, consulta e check-in público, convidados e proteção contra duplicidade no servidor |
| Indicadores | Dashboard autenticado existente | Definir denominador, atividades elegíveis e representação institucional para percentuais; não inferir regras pelo número de pessoas |
| Dashboard público | `/dashboard` exige sessão | Fornecer API pública com indicadores agregados, instituições/logos autorizados, diretoria, calendário e documentos públicos; não reutilizar endpoints privados |
| Exportações | CSV e impressão para PDF | Excel real e relatórios por perfil/período, com os mesmos limites de acesso das consultas |
| Governança | Exclusões têm controles visuais; demais garantias não verificáveis no frontend | Auditoria no servidor, backup/restauração, arquivamento, versionamento e regras de retenção |

## Ordem de implementação

1. Sessão, papéis e escopo institucional, incluindo testes de acesso por URL e por API.
2. Cadastro institucional e representantes, documentos e solicitações de aprovação.
3. Reuniões e eventos separados, credenciamento e check-in.
4. Cálculo de participação, relatórios e dashboard público.
5. Convocações, atas, encaminhamentos, notificações, importação e calendário unificado.

## Dependência para concluir

Este repositório contém o frontend. É necessário localizar o backend e seus contratos para implementar os recursos com persistência e autorização efetivas. Não substituir essas dependências por dados simulados ou endpoints presumidos. O papel `leitura` não deve ser convertido automaticamente em representante: falta o vínculo com a instituição. O papel `gestor` também não equivale integralmente à Diretoria, que aprova alterações institucionais.

O ajuste de logout é uma correção pontual; os demais requisitos do PDF continuam pendentes de implementação e integração.

## Atualização do frontend — 10/10/2026

A comparação acima registra o diagnóstico inicial. Nesta entrega foram acrescentadas:

- Rotas públicas `/dashboard`, `/publico` e `/checkin/:token`.
- Navegação dos novos perfis, bloqueio de páginas privadas para representante e carregamento de listas somente quando autorizado na interface.
- Área institucional com solicitação de alterações e acompanhamento.
- Eventos separados: listagem, filtros, cadastro, edição e detalhes.
- Formulários complementares de governança de instituições, representantes e reuniões.
- Solicitações com confirmação de aprovação/rejeição e tratamento de falhas.
- Componentes de documentos/logo, credenciamento, QR recebido do servidor, check-in e presença manual.
- Solicitação de relatórios Excel/PDF ao backend; CSV e impressão dos dados filtrados já disponíveis na lista legada de presenças.
- Remoção do relatório antigo que oferecia tipos/períodos sem gerar os dados correspondentes.

Os módulos novos consomem o **contrato proposto** de `/api/governanca`; não foram homologados com o backend real. Na ausência do serviço a tela informa indisponibilidade, sem criar cadastros fictícios. A equipe do backend deve seguir [o prompt de integração](prompt-backend.md), que também documenta o que ainda não tem interface. Não considerar o PDF integralmente concluído.

### Verificação desta entrega

Lint e build aprovados. Cinco testes unitários de permissão aprovados. Dezesseis cenários de navegador executados em desktop e celular (32 verificações) aprovados, com API simulada: fluxos legados, falha de logout, dashboard público sem consultas privadas, serviço indisponível, isolamento institucional, solicitação, evento separado, check-in, aprovação e upload multipart. Os dois cenários extras e as correções de seletores foram reexecutados separadamente após a suíte de 28 verificações.

O ambiente local utiliza Node 20.16 e o Vite avisa que essa versão é antiga; o projeto declara Node 22 para produção. Os testes simulados não substituem homologação com o backend real.

### Verificação em 26/10/2026

Lint e build aprovados. Nove testes unitários de permissão/fila e 54 verificações de navegador (27 cenários em desktop e celular) aprovados com API simulada. A suíte cobre contas, bloqueios por URL, importação em duas etapas, notificações, paginação da auditoria, convocações/RSVP, encaminhamentos, solicitações de correção/substituição e reenvio da fila com a mesma chave, além dos fluxos anteriores. Não houve gravação de dados nem envio de e-mails no backend de produção. O Node local 20.16 gera aviso do Vite; o projeto continua declarando Node 22.
