# Conferência das telas e do quadro

## Implementado e conectado à API

- Login, recuperação da sessão e logout; rotas próprias `/login` e `/esqueci-senha`.
- Solicitação de recuperação de senha.
- Instituições: lista, filtros, cadastro, edição, consulta, mudança de status e exclusão.
- Representantes: lista, filtros, cadastro, edição, detalhes e vínculo informado no cadastro.
- Reuniões: lista, filtros, cadastro, edição e detalhes.
- Dashboard: indicadores, evolução e participação por instituição a partir da API.
- Deploy de produção na Vercel.

## Complementado na revisão das pendências

- Proteção de acesso por recurso do menu e de formulários por papel.
- Botões de criação/edição ocultos para consulta; exclusão restrita a administrador na interface.
- Lista de presenças com filtros por participante/reunião, status, convidado, instituição e período.
- Histórico por representante e instituição, derivado das listas de participantes das reuniões.
- Gestão de vínculos: consulta, criação e encerramento com confirmação.
- Testes automatizados de permissões, incluindo URLs diretas.
- Correção da atualização de status da instituição: só recarrega após sucesso explícito.
- README alinhado ao código, tecnologias, Node 22, rotas e configuração de produção.

## Ainda em implementação / aguardando contrato

- QR Code e check-in público.
- Upload, listagem e download de documentos.
- Redefinição da senha pelo token recebido.
- Exclusão ou cancelamento de reuniões conforme regras do backend.
- Relatórios completos por tipo e período; atualmente a exportação é local, PDF pela impressão e CSV.
- Testes completos com o backend real, incluindo gravações e os módulos ainda pendentes.

A documentação da integração informa recursos de check-in e documentos no backend, mas não fornece todos os contratos. A ausência de uma tela não confirma ausência do recurso no backend.

## Diferenças do planejamento

O quadro menciona Next.js/App Router, shadcn/ui e Atomic Design. A implementação usa Vite/React Router, componentes próprios e organização por funcionalidades. Essas diferenças devem ser alinhadas com os critérios da entrega; não foram feitas migrações de framework.

## Verificação desta revisão

Três testes unitários de permissão passaram. Oito cenários de navegador (quatro em desktop e quatro em celular) passaram com API simulada: redirecionamento/recuperação, bloqueio de consulta, acesso de gestor e filtros de presença/largura da página. As consultas reais confirmaram o formato de participantes e vínculos, mas não foram feitas mutações em produção.
