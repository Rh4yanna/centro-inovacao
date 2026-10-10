import { api } from './cliente';

// Contrato v1 descrito em docs/prompt-backend.md. Separado da API legada.
export async function governanca(path, options = {}) {
  const result = await api(`/api/governanca${path}`, options);
  if (!result || result.versao !== 1) throw new Error('Este serviço ainda não está disponível. Tente novamente mais tarde.');
  return result;
}

export function urlSegura(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}
