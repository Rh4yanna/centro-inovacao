import assert from 'node:assert/strict';
import { test } from 'node:test';
import { podeAbrir, podeEditar, podeExcluir } from '../src/auth/permissoes.js';
const usuario = papel => ({papel, menu:[{href:'/instituicoes'}, {href:'/reunioes'}]});
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
