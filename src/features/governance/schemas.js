export const institutionSchema = [
  ['nomeFantasia','Nome fantasia','required'],['razaoSocial','Razão social','required'],['cnpj','CNPJ','required'],
  ['telefone','Telefone','tel'],['email','E-mail institucional','email'],['endereco','Endereço completo'],
  ['vertente','Vertente do ecossistema'],['gts','Grupos de trabalho (separados por vírgula)'],['dataIngresso','Data de ingresso','date'],
  ['situacaoAdesao','Situação da adesão','text',['rascunho','aguardando_documentos','em_analise','ajustes_solicitados','aprovada','inativa','desligada']],
  ['contatosComunicacao','Contatos de comunicação','textarea'],['redesSociais','Redes sociais','textarea'],
  ['autorizaDivulgacao','Autoriza divulgação pública da instituição e da logo','checkbox'],
  ['titular','Nome do titular'],['suplente','Nome do suplente'],['motivoSaida','Motivo da inativação, saída ou substituição','textarea'],['dataSaida','Data da inativação ou saída','date'],
];
export const eventSchema = [
  ['titulo','Título','required'],['categoria','Categoria','required',['workshop','missao_tecnica','palestra','evento_parceiro','calendario_unificado']],
  ['data','Data','date'],['horaInicio','Horário inicial','time'],['horaFim','Horário final','time'],
  ['modalidade','Modalidade','required',['presencial','online','hibrida']],['local','Local'],['endereco','Endereço completo'],
  ['linkTransmissao','Link da transmissão','url'],['organizacao','Organização responsável','required'],
  ['origem','Organização do evento','text',['proprio','parceiro']],['inscricaoExterna','Inscrição externa','url'],['imagemUrl','Imagem de divulgação (URL)','url'],
  ['publicoAlvo','Público-alvo'],['limiteParticipantes','Limite de participantes','number'],
  ['status','Status','required',['rascunho','publicada','em_andamento','encerrada','cancelada']],
  ['descricao','Descrição','textarea'],['pauta','Programação / pauta','textarea'],['encaminhamentos','Encaminhamentos, responsáveis e prazos','textarea'],
  ['exibirCalendario','Exibir no calendário público','checkbox'],['contaParticipacao','Conta para a participação oficial','checkbox'],
];
export const meetingSchema = [
  ['tipo','Tipo de reunião','required',['ordinaria','extraordinaria','diretoria','gt']],['numero','Número da reunião','number'],
  ['modalidade','Modalidade','required',['presencial','online','hibrida']],['organizador','Responsável pela organização'],
  ['publicoAlvo','Público-alvo'],['instituicoesConvocadas','IDs das instituições convocadas (separados por vírgula)'],
  ['limiteParticipantes','Limite de participantes','number'],['status','Situação','required',['rascunho','publicada','em_andamento','encerrada','cancelada']],
  ['pauta','Pauta','textarea'],['ata','Ata','textarea'],['encaminhamentos','Encaminhamentos, responsáveis e prazos','textarea'],
  ['contaParticipacao','Conta para a participação oficial','checkbox'],
];
export const representativeSchema = [
  ['tipo','Tipo de representação','required',['titular','suplente','adicional','convidado']],['cargoForum','Cargo no Fórum'],
  ['vertente','Vertente'],['gts','GTs (separados por vírgula)'],['inicio','Início do vínculo','date'],['fim','Encerramento do vínculo','date'],
  ['motivoSubstituicao','Motivo da substituição','textarea'],['oficioId','Identificador do ofício de indicação'],['usuarioId','Identificador do usuário vinculado'],
  ['autorizaComunicacoes','Autoriza receber comunicações','checkbox'],
];
