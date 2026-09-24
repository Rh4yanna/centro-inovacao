// Contexto separado do componente para o hot reload do Vite não reclamar.
import { createContext, useContext } from 'react';

export const ContextoDominios = createContext(null);

const SEM_DADOS = {
  carregando: false,
  tipos: [],
  areas: [],
  statusInstituicao: [],
  idDoTipo: () => undefined,
  idDaArea: () => undefined,
};

export function useDominios() {
  return useContext(ContextoDominios) || SEM_DADOS;
}
