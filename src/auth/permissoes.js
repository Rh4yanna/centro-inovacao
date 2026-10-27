export function podeEditar(user) {
  return ['administrador', 'admin', 'admin_geral', 'gestor', 'diretoria'].includes(user?.papel);
}
export function podeExcluir(user) {
  return ['administrador', 'admin', 'admin_geral'].includes(user?.papel);
}
export const representanteInstitucional = user => ['representante', 'representante_instituicao'].includes(user?.papel);
const consultasRepresentante = ['/instituicoes', '/reunioes', '/eventos'];
const paginasRepresentante = ['/dashboard', '/minha-instituicao', '/notificacoes', ...consultasRepresentante];
const itens = [
  ['/dashboard','Dashboard'],['/instituicoes','Instituições'],['/representantes','Representantes'],['/reunioes','Reuniões'],['/eventos','Eventos'],['/presencas','Presenças'],['/solicitacoes','Solicitações'],['/minha-instituicao','Minha instituição'],
  ['/contas','Contas e permissões'],['/importacoes','Importação'],['/auditoria','Histórico de alterações'],['/notificacoes','Notificações'],
];
export function menuDoUsuario(user) {
  if (!user) return [];
  const permitido = href => !(['/contas','/importacoes'].includes(href) && !podeExcluir(user)) && !(['/auditoria','/solicitacoes'].includes(href) && !podeEditar(user));
  if (representanteInstitucional(user)) return itens.filter(([href]) => paginasRepresentante.includes(href)).map(([href,rotulo]) => ({href,rotulo}));
  if (['admin_geral','diretoria'].includes(user.papel)) return itens.filter(([href]) => href !== '/minha-instituicao' && permitido(href)).map(([href,rotulo]) => ({href,rotulo}));
  if (!['administrador','admin','gestor','leitura'].includes(user.papel)) return [];
  const menu = (user.menu || []).filter(i => itens.some(([href]) => href === i.href) && permitido(i.href) && i.href !== '/minha-instituicao');
  for (const href of ['/notificacoes', ...(podeEditar(user) ? ['/auditoria'] : []), ...(podeExcluir(user) ? ['/contas','/importacoes'] : [])]) if (!menu.some(i => i.href === href)) menu.push({href,rotulo:itens.find(i => i[0] === href)[1]});
  if (podeEditar(user)) for (const href of ['/eventos','/solicitacoes']) if (!menu.some(i => i.href === href)) menu.push({href,rotulo:itens.find(i => i[0] === href)[1]});
  return menu;
}
export function podeAbrir(user, pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (!user) return false;
  if (representanteInstitucional(user)) return paginasRepresentante.includes(path) || consultasRepresentante.some(base => path.startsWith(base + '/') && path.slice(base.length + 1).split('/').length === 1 && !['novo', 'nova', 'editar'].includes(path.slice(base.length + 1)));
  if (user.papel === 'diretoria' && /^\/instituicoes\/(?:nova|[^/]+\/editar)$/.test(path)) return false;
  const resource = menuDoUsuario(user).some(item => path === item.href || path.startsWith(item.href + '/'));
  if (!resource) return false;
  return !/(?:\/novo|\/nova|\/editar)$/.test(path) || podeEditar(user);
}
