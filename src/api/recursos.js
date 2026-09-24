// Uma função por operação que as telas precisam.
import { get, post, patch, remover } from './cliente';
import {
  instituicaoDaApi,
  instituicaoDaLista,
  instituicaoParaApi,
  representanteDaApi,
  representanteParaApi,
  reuniaoDaApi,
  reuniaoParaApi,
  statusInstituicaoParaApi,
} from './mapas';

// A listagem da API é paginada; as telas filtram tudo em memória.
async function todasAsPaginas(caminho, mapear) {
  const itens = [];
  let pagina = 1;
  for (;;) {
    const sep = caminho.includes('?') ? '&' : '?';
    const r = await get(`${caminho}${sep}pagina=${pagina}&porPagina=100`);
    const lote = r?.dados || [];
    itens.push(...lote.map(mapear));
    if (lote.length < 100 || pagina >= 20) break;
    pagina += 1;
  }
  return itens;
}

export const sessao = {
  entrar: (email, senha) => post('/api/sessao', { email, senha }),
  atual: () => get('/api/sessao'),
  sair: () => remover('/api/sessao'),
};

export const instituicoes = {
  listar: () => todasAsPaginas('/api/instituicoes', instituicaoDaLista),
  obter: (id) => get(`/api/instituicoes/${id}`).then(instituicaoDaApi),
  criar: (form, dominios) =>
    post('/api/instituicoes', instituicaoParaApi(form, dominios)),
  editar: (id, form, dominios) =>
    patch(`/api/instituicoes/${id}`, instituicaoParaApi(form, dominios)),
  trocarStatus: (id, rotulo, motivo) =>
    post(`/api/instituicoes/${id}/status`, {
      status: statusInstituicaoParaApi(rotulo),
      motivo: motivo || undefined,
    }),
  excluir: (id) => remover(`/api/instituicoes/${id}`),
};

export const representantes = {
  // Rota provisoria: suporte do backend ainda precisa ser confirmado.
  excluir: (id) => remover(`/api/representantes/${encodeURIComponent(id)}`),
  listar: () => todasAsPaginas('/api/representantes', representanteDaApi),
  obter: (id) => get(`/api/representantes/${id}`).then(representanteDaApi),
  criar: (form) => post('/api/representantes', representanteParaApi(form)),
  editar: (id, form) => patch(`/api/representantes/${id}`, representanteParaApi(form)),
  encerrarVinculo: (vinculoId) => post(`/api/vinculos/${vinculoId}/encerrar`, {}),
  criarVinculo: (pessoaId, instituicaoId, cargo) =>
    post('/api/vinculos', { pessoaId, instituicaoId, cargo: cargo || undefined }),
};

export const reunioes = {
  listar: () => todasAsPaginas('/api/reunioes', reuniaoDaApi),
  obter: (id) => get(`/api/reunioes/${id}`).then(reuniaoDaApi),
  criar: (form) => post('/api/reunioes', reuniaoParaApi(form)),
  editar: (id, form) => patch(`/api/reunioes/${id}`, reuniaoParaApi(form)),
  participantes: (id) => get(`/api/reunioes/${id}/participantes`),
  presencas: (id) => get(`/api/reunioes/${id}/participantes`),
};

export const indicadores = {
  obter: () => get('/api/indicadores'),
};
