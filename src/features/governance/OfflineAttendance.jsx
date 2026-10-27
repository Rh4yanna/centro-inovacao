import { useState } from 'react';
import { useUsuario } from '../../auth/contexto';
import { governanca } from '../../api/governanca';
import { Card, Modal } from '../institutions/components';
import { readPending, removePending, savePending } from './offlineQueue';

export default function OfflineAttendance({ scope, person, people = [], onSynced }) {
  const user = useUsuario();
  const [state, setState] = useState(() => {
    try { return { items: readPending(user?.id, sessionStorage), error: '' }; }
    catch (e) { return { items: [], error: e.message }; }
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [discard, setDiscard] = useState(null);
  const pending = state.items.filter(i => i.scope === scope);
  function refresh() { setState({ items: readPending(user.id, sessionStorage), error: '' }); }
  function save() {
    setMessage('');
    try { savePending(user?.id, scope, person, sessionStorage); refresh(); setMessage('Guardado neste dispositivo. A presença ainda não foi enviada nem confirmada.'); }
    catch (e) { setState(s => ({ ...s, error: e.message })); }
  }
  async function sync() {
    if (busy) return;
    setBusy(true); setMessage('');
    let count = 0;
    try {
      const items = readPending(user.id, sessionStorage).filter(i => i.scope === scope);
      for (const item of items) {
        const result = await governanca(`/${scope}/presencas`, { metodo: 'POST', corpo: { ...item.corpo, chaveOperacao: item.id, registradoOfflineEm: new Date(item.criadoEm).toISOString() } });
        if (result.confirmado !== true) throw new Error('O servidor não confirmou o registro. Ele permanece pendente.');
        removePending(user.id, item.id, sessionStorage); count++; refresh();
      }
      setMessage(`${count} registros confirmados pelo servidor.`);
      if (count) onSynced();
    } catch (e) { setState(s => ({ ...s, error: `${count} enviados. ${e.message}` })); }
    finally { setBusy(false); }
  }
  return <Card title="Presenças pendentes neste dispositivo"><p>Se a conexão falhar, guarde os dados preenchidos acima e sincronize quando ela voltar. Os registros ficam nesta aba por até 24 horas e são apagados ao sair da conta ou fechar a aba.</p>
    {state.error && <p role="alert">{state.error}</p>}{message && <p role="status">{message}</p>}
    <button type="button" disabled={busy || !user?.id} onClick={save}>Guardar presença para enviar depois</button>
    {pending.map(item => <p key={item.id}>{people.find(p => p.id === item.corpo.pessoaId)?.nome || 'Participante cadastrado'} · {item.corpo.statusPresenca} · Pendente de envio <button disabled={busy} onClick={() => setDiscard(item)}>Descartar</button></p>)}
    {!pending.length && <p>Nenhuma presença pendente nesta atividade.</p>}
    <button type="button" disabled={busy || !pending.length} onClick={sync}>{busy ? 'Sincronizando...' : 'Enviar presenças pendentes'}</button>
    {discard && <Modal title="Descartar presença pendente" onClose={() => setDiscard(null)}><p>Este registro não foi confirmado pelo servidor. Deseja removê-lo deste dispositivo?</p><button onClick={() => setDiscard(null)}>Cancelar</button><button onClick={() => { try { removePending(user.id, discard.id, sessionStorage); refresh(); setDiscard(null); } catch (e) { setState(s => ({ ...s, error: e.message })); } }}>Confirmar descarte</button></Modal>}
  </Card>;
}
