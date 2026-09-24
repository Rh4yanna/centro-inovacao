import { useUsuario } from './contexto';
import { podeEditar, podeExcluir } from './permissoes';
export function Permissao({ children, excluir = false }) {
  const user = useUsuario();
  return (excluir ? podeExcluir(user) : podeEditar(user)) ? children : null;
}
