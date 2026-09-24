// Cliente HTTP da API. Tudo passa por aqui.
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

// Erro que carrega os campos recusados pelo back, pra pintar no formulário.
export class ErroDaApi extends Error {
  constructor(status, corpo) {
    super(corpo?.erro?.mensagem || 'Não foi possível concluir a operação.');
    this.name = 'ErroDaApi';
    this.status = status;
    this.codigo = corpo?.erro?.codigo || 'ERRO';
    this.campos = corpo?.erro?.campos || [];
  }

  // { nome: 'Informe o nome.', cnpj: 'CNPJ inválido.' }
  porCampo() {
    return Object.fromEntries(this.campos.map((c) => [c.campo, c.mensagem]));
  }
}

let aoPerderSessao = null;
export function quandoPerderSessao(fn) {
  aoPerderSessao = fn;
}

export async function api(caminho, opcoes = {}) {
  const { corpo, metodo = 'GET', ...resto } = opcoes;
  let resposta;
  try {
    resposta = await fetch(`${BASE}${caminho}`, {
      ...resto,
      method: metodo,
      credentials: 'include',
      headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ErroDaApi(0, {
      erro: { codigo: 'SEM_CONEXAO', mensagem: 'Não foi possível falar com o servidor. Verifique sua conexão.' },
    });
  }

  // Sessão caiu: avisa o App pra voltar ao login. No próprio login não vale.
  if (resposta.status === 401 && caminho !== '/api/sessao') {
    aoPerderSessao?.();
  }

  if (resposta.status === 204) return null;

  const texto = await resposta.text();
  let dados;
  try {
    dados = texto ? JSON.parse(texto) : null;
  } catch {
    dados = null;
  }

  if (!resposta.ok) throw new ErroDaApi(resposta.status, dados);
  return dados;
}

export const get = (caminho) => api(caminho);
export const post = (caminho, corpo) => api(caminho, { metodo: 'POST', corpo });
export const patch = (caminho, corpo) => api(caminho, { metodo: 'PATCH', corpo });
export const remover = (caminho) => api(caminho, { metodo: 'DELETE' });
