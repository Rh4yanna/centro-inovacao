const prefix = 'cti-presencas-pendentes:';
const lifetime = 24 * 60 * 60 * 1000;
const key = userId => {
  if (!userId) throw new Error('A sessão precisa identificar o usuário para guardar presenças neste dispositivo.');
  return prefix + encodeURIComponent(userId);
};
export function readPending(userId, storage, now = Date.now()) {
  const raw = storage.getItem(key(userId));
  if (!raw) return [];
  let items;
  try { items = JSON.parse(raw); } catch { throw new Error('Não foi possível ler as presenças pendentes deste dispositivo.'); }
  if (!Array.isArray(items)) throw new Error('O armazenamento de presenças pendentes é inválido.');
  const valid = items.filter(i => i && typeof i.id === 'string' && typeof i.scope === 'string' && i.corpo?.pessoaId && Number.isFinite(i.criadoEm) && now >= i.criadoEm && now - i.criadoEm < lifetime);
  if (valid.length !== items.length) storage.setItem(key(userId), JSON.stringify(valid));
  return valid;
}
export function savePending(userId, scope, corpo, storage, now = Date.now()) {
  if (!/^(reunioes|eventos)\/[^/]+$/.test(scope) || !corpo.pessoaId || !corpo.justificativa?.trim()) throw new Error('Selecione o participante e informe a justificativa antes de guardar.');
  const items = readPending(userId, storage, now);
  if (items.length >= 50) throw new Error('Limite de 50 registros pendentes atingido. Sincronize antes de continuar.');
  if (items.some(i => i.scope === scope && i.corpo.pessoaId === corpo.pessoaId)) throw new Error('Este participante já tem um registro pendente nesta atividade. Sincronize ou descarte o anterior.');
  const item = { id: crypto.randomUUID(), scope, corpo: { ...corpo }, criadoEm: now };
  storage.setItem(key(userId), JSON.stringify([...items, item]));
  return item;
}
export function removePending(userId, id, storage) {
  storage.setItem(key(userId), JSON.stringify(readPending(userId, storage).filter(i => i.id !== id)));
}
export function clearPending(storage) {
  for (let i = storage.length - 1; i >= 0; i--) { const name = storage.key(i); if (name?.startsWith(prefix)) storage.removeItem(name); }
}
