import assert from 'node:assert/strict';
import { test } from 'node:test';
import { podeAbrir, podeEditar, podeExcluir } from '../src/auth/permissoes.js';
import { menuDoUsuario } from '../src/auth/permissoes.js';
const usuario = papel => ({papel, menu:[{href:'/instituicoes'}, {href:'/reunioes'}]});
test('somente administradores gerenciam contas e importações mesmo com menu incorreto', () => {
  for (const papel of ['diretoria', 'gestor', 'leitura', 'representante_instituicao', 'desconhecido']) {
    const u = { papel, menu: [{href:'/contas'}, {href:'/importacoes'}, {href:'/auditoria'}] };
    assert.equal(podeAbrir(u, '/contas'), false);
    assert.equal(podeAbrir(u, '/importacoes'), false);
  }
  assert.equal(podeAbrir(usuario('admin_geral'), '/contas'), true);
  assert.equal(podeAbrir(usuario('diretoria'), '/auditoria'), true);
  assert.equal(podeAbrir(usuario('leitura'), '/auditoria'), false);
  assert.equal(podeAbrir(usuario('representante_instituicao'), '/notificacoes'), true);
});
test('representante consulta catalogos e detalhes sem acesso a alteracoes', () => {
  for (const papel of ['representante', 'representante_instituicao']) {
    const u = usuario(papel);
    for (const base of ['/instituicoes', '/reunioes', '/eventos']) {
      for (const path of [base, base + '/123', base + '/123/']) assert.equal(podeAbrir(u, path), true);
      for (const suffix of ['/novo', '/nova/', '/123/editar', '/123/excluir']) assert.equal(podeAbrir(u, base + suffix), false);
    }
    for (const path of ['/presencas', '/representantes', '/contas', '/auditoria', '/instituicoes-outras']) assert.equal(podeAbrir(u, path), false);
    assert.equal(podeAbrir(u, '/minha-instituicao'), true);
    assert.equal(podeEditar(u), false);
    assert.equal(podeExcluir(u), false);
    assert.equal(menuDoUsuario(u).length, 6);
  }
});

test('diretoria aprova alterações, gerencia atividades e não exclui registros', () => {
  const u = usuario('diretoria');
  assert.equal(podeAbrir(u, '/solicitacoes'), true);
  assert.equal(podeAbrir(u, '/eventos/novo'), true);
  assert.equal(podeAbrir(u, '/instituicoes/123/editar'), false);
  assert.equal(podeAbrir(u, '/instituicoes/nova'), false);
  assert.equal(podeExcluir(u), false);
  assert.equal(podeExcluir(usuario('admin_geral')), true);
  assert.equal(podeAbrir(usuario('desconhecido'), '/instituicoes'), false);
});
test('consulta pode ler, mas não abrir formulários por URL', () => {
  const u = usuario('leitura');
  assert.equal(podeAbrir(u, '/instituicoes/123'), true);
  for (const p of ['/instituicoes/nova', '/instituicoes/123/editar', '/reunioes/nova/']) assert.equal(podeAbrir(u,p),false);
  assert.equal(podeEditar(u), false);
  assert.equal(podeExcluir(u), false);
});
test('gestor edita, exclusão exige administrador', () => {
  assert.equal(podeAbrir(usuario('gestor'), '/instituicoes/123/editar'), true);
  assert.equal(podeExcluir(usuario('gestor')),false);
  assert.equal(podeExcluir(usuario('administrador')),true);
});
test('sessão ausente, papel desconhecido e recurso não concedido são bloqueados', () => {
  assert.equal(podeAbrir(null, '/instituicoes'),false);
  assert.equal(podeEditar(usuario('desconhecido')),false);
  assert.equal(podeAbrir(usuario('administrador'), '/documentos'),false);
  assert.equal(podeAbrir(usuario('leitura'), '/instituicoes-outras'),false);
});
