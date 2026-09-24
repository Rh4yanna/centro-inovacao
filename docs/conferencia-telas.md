# Conferência das telas enviadas

## Já existiam
- Dashboard com indicadores, gráficos e próximas reuniões.
- Lista de instituições, filtros e paginação.
- Nova instituição e edição.
- Visão geral de instituições ativas e inativas.
- Ativação/desativação, menu de ações, modal de relatório e confirmação de exclusão.

## Complementado nesta revisão
- Representantes: lista, busca por nome/e-mail, filtros por cargo/status, paginação e cadastro com dados pessoais, instituição, função e endereço.
- Representantes: detalhes e edição para dar continuidade às ações da lista.
- Reuniões: lista, busca, filtros por status/período, paginação e cadastro com data, horário, local, descrição, link e senha.
- Reuniões: detalhes e edição, acessíveis pela lista e pelo Dashboard.
- Dashboard usa a mesma coleção de reuniões da listagem; criação abre o formulário completo.
- Instituições: cinco abas disponíveis nos dois estados; representantes vinculados exibidos com contagem real.
- Representantes e reuniões são persistidos no navegador; erros de armazenamento são informados sem sair do formulário.

## Limites e diferenças em relação às imagens
- Dados iniciais são demonstrativos. Não existe integração com backend.
- Participações, reuniões vinculadas à instituição e documentos exibem estados vazios porque não há registros associados nem serviço de documentos.
- Indicadores históricos dos gráficos do Dashboard permanecem ilustrativos e estão identificados na página.
- O modal de relatório já existente oferece impressão para PDF e CSV compatível com Excel; não produz XLSX. Os relatórios especializados ainda dependem dos históricos.
- A tela de Presenças não foi detalhada nas referências enviadas; exibe estado vazio.
- Notificações e autenticação continuam dependendo da integração futura.

## Validação
- Build de produção e ESLint concluídos.
- Não houve validação visual automatizada em navegador nesta revisão.
- O Vite emitiu aviso sobre Node 20.16: exige 20.19+ ou 22.12+, embora o build tenha concluído.
