export function podeEditar(user) {
  return ['administrador', 'admin', 'gestor'].includes(user?.papel);
}
export function podeExcluir(user) {
  return ['administrador', 'admin'].includes(user?.papel);
}
export function podeAbrir(user, pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (!user) return false;
  const resource = (user.menu || []).some(item => path === item.href || path.startsWith(item.href + '/'));
  if (!resource) return false;
  return !/(?:\/novo|\/nova|\/editar)$/.test(path) || podeEditar(user);
}
