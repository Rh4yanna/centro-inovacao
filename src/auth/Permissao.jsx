import { useUsuario } from './contexto';
import { podeEditar, podeExcluir } from './permissoes';
export function Permissao({ children, excluir = false, recurso }) {
  const user = useUsuario();
  if (recurso === "instituicoes" && user?.papel === "diretoria") return null;
  return (excluir ? podeExcluir(user) : podeEditar(user)) ? children : null;
}
