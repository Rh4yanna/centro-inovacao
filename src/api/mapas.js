// De-para entre os nomes das telas (em inglês) e os da API (em português).
// Fica tudo aqui para os componentes continuarem usando o formato de sempre.

const digitos = (v) => String(v || '').replace(/\D/g, '');

const formatarCnpj = (v) => {
  const d = digitos(v);
  return d.length === 14
    ? d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    : v || '';
};

const formatarCpf = (v) => {
  const d = digitos(v);
  return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : v || '';
};

// --- status ---------------------------------------------------------------

const STATUS_INSTITUICAO = {
  ativa: 'Ativa',
  inativa: 'Inativa',
  em_processo_entrada: 'Em processo de entrada',
};
const STATUS_INSTITUICAO_API = {
  Ativa: 'ativa',
  Inativa: 'inativa',
  'Em processo de entrada': 'em_processo_entrada',
};

const STATUS_REUNIAO = {
  agendada: 'Agendada',
  em_andamento: 'Em andamento',
  encerrada: 'Realizada',
  cancelada: 'Cancelada',
};
const STATUS_REUNIAO_API = {
  Agendada: 'agendada',
  'Em andamento': 'em_andamento',
  Realizada: 'encerrada',
  Cancelada: 'cancelada',
};

export const rotuloStatusInstituicao = (v) => STATUS_INSTITUICAO[v] || v || '';
export const rotuloStatusReuniao = (v) => STATUS_REUNIAO[v] || v || '';

// --- instituição ----------------------------------------------------------

// Linha da listagem: a API manda menos campos que o detalhe.
export function instituicaoDaLista(i) {
  return {
    id: i.id,
    name: i.nome,
    cnpj: formatarCnpj(i.cnpj),
    email: i.email || '',
    type: i.tipo || '',
    area: i.area || '',
    city: i.cidade || '',
    state: i.uf || '',
    status: rotuloStatusInstituicao(i.status),
    representantesAtivos: i.representantesAtivos ?? 0,
  };
}

export function instituicaoDaApi(i) {
  const e = i.endereco || {};
  const c = i.classificacao || {};
  const cad = i.cadastro || {};
  const p = i.participacao || {};
  return {
    id: i.id,
    name: i.nome,
    cnpj: i.cnpjFormatado || formatarCnpj(i.cnpj),
    founded: i.dataFundacao || '',
    status: rotuloStatusInstituicao(i.status),
    email: i.email || '',
    phone: i.telefone || '',
    site: i.site || '',
    street: e.logradouro || '',
    number: e.numero || '',
    neighborhood: e.bairro || '',
    city: e.cidade || '',
    state: e.estado || '',
    zip: e.cep || '',
    complement: e.complemento || '',
    type: c.tipo || '',
    area: c.area || '',
    description: c.descricao || '',
    createdAt: cad.criadoEm || '',
    createdBy: cad.criadoPor || '',
    updatedAt: cad.atualizadoEm || '',
    updatedBy: cad.atualizadoPor || '',
    participacao: p,
    representantes: (i.representantes || []).map(representanteDoVinculo),
    totalRepresentantes: i.totalRepresentantes ?? 0,
  };
}

// dominios traz as listas para converter o rótulo do select no id que a API espera.
export function instituicaoParaApi(form, dominios) {
  return {
    nome: (form.name || '').trim(),
    cnpj: digitos(form.cnpj),
    dataFundacao: form.founded || undefined,
    status: STATUS_INSTITUICAO_API[form.status] || 'em_processo_entrada',
    email: form.email || undefined,
    telefone: form.phone || undefined,
    site: form.site || undefined,
    logradouro: form.street || undefined,
    numero: form.number || undefined,
    bairro: form.neighborhood || undefined,
    cidade: form.city || undefined,
    estado: form.state || undefined,
    cep: digitos(form.zip) || undefined,
    complemento: form.complement || undefined,
    tipoInstituicaoId: dominios?.idDoTipo(form.type),
    areaAtuacaoId: dominios?.idDaArea(form.area),
    descricao: form.description || undefined,
  };
}

// --- representante --------------------------------------------------------

// A API separa pessoa de vínculo; a tela usa os dois num objeto só.
export function representanteDaApi(r) {
  const v = r.vinculoAtual || r.vinculos?.[0] || {};
  return {
    id: r.id,
    name: r.nome,
    cpf: formatarCpf(r.cpf),
    email: r.email || '',
    phone: r.telefone || '',
    institutionId: v.instituicaoId || '',
    institutionName: v.instituicao || '',
    role: v.cargo || '',
    status: v.status === 'ativo' ? 'Ativo' : v.status ? 'Inativo' : '',
    vinculoId: v.vinculoId || '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zip: '',
    complement: '',
  };
}

function representanteDoVinculo(v) {
  return {
    id: v.pessoaId,
    vinculoId: v.vinculoId,
    name: v.nome,
    email: v.email || '',
    phone: v.telefone || '',
    role: v.cargo || '',
    status: v.status === 'ativo' ? 'Ativo' : 'Inativo',
  };
}

export function representanteParaApi(form) {
  return {
    nome: (form.name || '').trim(),
    cpf: digitos(form.cpf) || undefined,
    email: form.email || undefined,
    telefone: form.phone || undefined,
    vinculo: form.institutionId
      ? { instituicaoId: form.institutionId, cargo: (form.role || '').trim() || undefined }
      : undefined,
  };
}

// --- reunião --------------------------------------------------------------

export function reuniaoDaApi(m) {
  // Agendada mostra confirmados; encerrada mostra quem apareceu.
  const contagem = m.status === 'agendada' ? m.confirmados : m.presentes;
  return {
    id: m.id,
    name: m.titulo,
    description: m.descricao || '',
    date: m.data || '',
    time: (m.horaInicio || '').slice(0, 5),
    endTime: (m.horaFim || '').slice(0, 5),
    place: m.local || '',
    address: m.endereco || '',
    status: rotuloStatusReuniao(m.status),
    link: m.link || '',
    password: m.senhaAcesso || '',
    count: contagem ?? 0,
    esperados: m.esperados ?? 0,
    confirmados: m.confirmados ?? 0,
    presentes: m.presentes ?? 0,
    percentual: m.percentualComparecimento,
  };
}

export function reuniaoParaApi(form) {
  return {
    titulo: (form.name || '').trim(),
    descricao: form.description || undefined,
    data: form.date,
    horaInicio: form.time || undefined,
    horaFim: form.endTime || undefined,
    local: form.place || undefined,
    endereco: form.address || undefined,
    link: form.link || undefined,
    senhaAcesso: form.password || undefined,
  };
}

export const statusReuniaoParaApi = (rotulo) => STATUS_REUNIAO_API[rotulo] || 'agendada';
export const statusInstituicaoParaApi = (rotulo) => STATUS_INSTITUICAO_API[rotulo] || 'ativa';
