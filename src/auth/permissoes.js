export function podeEditar(user) {
  return ['administrador', 'admin', 'admin_geral', 'gestor', 'diretoria'].includes(user?.papel);
}
export function podeExcluir(user) {
  return ['administrador', 'admin', 'admin_geral'].includes(user?.papel);
}
export const representanteInstitucional = user => ['representante', 'representante_instituicao'].includes(user?.papel);
const itens = [
  ['/dashboard','Dashboard'],['/instituicoes','Instituições'],['/representantes','Representantes'],['/reunioes','Reuniões'],['/eventos','Eventos'],['/presencas','Presenças'],['/solicitacoes','Solicitações'],['/minha-instituicao','Minha instituição'],
];
export function menuDoUsuario(user) {
  if (!user) return [];
  if (representanteInstitucional(user)) return itens.filter(([href]) => ['/dashboard','/minha-instituicao'].includes(href)).map(([href,rotulo]) => ({href,rotulo}));
  if (['admin_geral','diretoria'].includes(user.papel)) return itens.filter(([href]) => href !== '/minha-instituicao').map(([href,rotulo]) => ({href,rotulo}));
  if (!['administrador','admin','gestor','leitura'].includes(user.papel)) return [];
  const menu = (user.menu || []).filter(i => itens.some(([href]) => href === i.href) && (i.href !== '/solicitacoes' || podeEditar(user)) && i.href !== '/minha-instituicao');
  if (podeEditar(user)) for (const href of ['/eventos','/solicitacoes']) if (!menu.some(i => i.href === href)) menu.push({href,rotulo:itens.find(i => i[0] === href)[1]});
  return menu;
}
export function podeAbrir(user, pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (!user) return false;
  if (representanteInstitucional(user)) return ['/dashboard','/minha-instituicao'].includes(path);
  if (user.papel === 'diretoria' && /^\/instituicoes\/(?:nova|[^/]+\/editar)$/.test(path)) return false;
  const resource = menuDoUsuario(user).some(item => path === item.href || path.startsWith(item.href + '/'));
  if (!resource) return false;
  return !/(?:\/novo|\/nova|\/editar)$/.test(path) || podeEditar(user);
}
