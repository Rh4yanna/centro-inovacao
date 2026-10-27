import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readPending, savePending, removePending, clearPending } from '../src/features/governance/offlineQueue.js';

function storage() {
  const map = new Map();
  return { getItem: k => map.get(k) ?? null, setItem: (k, v) => map.set(k, v), removeItem: k => map.delete(k), key: i => [...map.keys()][i], get length() { return map.size; } };
}
const person = { pessoaId: 'p1', justificativa: 'Falha de conexão', statusPresenca: 'presente' };
test('pendências são isoladas por usuário, atividade e participante', () => {
  const s = storage(); const a = savePending('u1', 'reunioes/r1', person, s);
  assert.equal(readPending('u2', s).length, 0);
  assert.throws(() => savePending('u1', 'reunioes/r1', person, s), /já tem/);
  savePending('u1', 'eventos/e1', person, s);
  removePending('u1', a.id, s);
  assert.equal(readPending('u1', s)[0].scope, 'eventos/e1');
});
test('registros expiram em 24 horas e logout limpa apenas a fila', () => {
  const s = storage(); s.setItem('preferencia', 'escuro');
  savePending('u1', 'reunioes/r1', person, s, 1000);
  assert.equal(readPending('u1', s, 1000 + 24 * 60 * 60 * 1000).length, 0);
  savePending('u2', 'reunioes/r1', person, s);
  clearPending(s); assert.equal(s.length, 1); assert.equal(s.getItem('preferencia'), 'escuro');
});
test('falha de armazenamento nunca confirma que o registro foi guardado', () => {
  const s = storage(); s.setItem = () => { throw new Error('Quota exceeded'); };
  assert.throws(() => savePending('u1', 'reunioes/r1', person, s), /Quota/);
  assert.throws(() => savePending('', 'reunioes/r1', person, s), /sessão/);
});
