import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../institutions/components';
import { Fields, Heading, Remote } from './shared';
import { useRecurso } from './useRecurso';
import { useAcao } from './useAcao';
import { ActionFeedback } from './ActionFeedback';

const safePath = path => typeof path === 'string' && /^\/[a-z0-9][a-z0-9/_-]*$/i.test(path);
export default function Notifications() {
  const resource = useRecurso('/notificacoes');
  const action = useAcao();
  const [unread, setUnread] = useState(false);
  return <><Heading title="Notificações">Acompanhe convocações, solicitações e atualizações do Fórum.</Heading><ActionFeedback action={action}/>
    <Remote resource={resource}>{data => <>
      <Card title="Mensagens"><label className="consent"><input type="checkbox" checked={unread} onChange={e => setUnread(e.target.checked)}/>Somente não lidas</label>
        {(data.dados || []).filter(n => !unread || !n.lidaEm).map(n => <article key={n.id} className="public-activity"><h3>{n.titulo}</h3><p>{n.mensagem}</p><small>{n.criadaEm ? new Date(n.criadaEm).toLocaleString('pt-BR') : ''}</small><div className="row-actions">{safePath(n.destino) && <Link className="button" to={n.destino}>Abrir</Link>}{!n.lidaEm && <button disabled={action.busy} onClick={() => action.run(`/notificacoes/${encodeURIComponent(n.id)}/lida`, {}, { onSuccess: resource.reload, message: 'Notificação marcada como lida.' })}>Marcar como lida</button>}</div></article>)}
        {!(data.dados || []).some(n => !unread || !n.lidaEm) && <p>Nenhuma notificação para este filtro.</p>}
      </Card>
      <Preferences key={JSON.stringify(data.preferencias)} initial={data.preferencias || {}}/>
    </>}</Remote></>;
}
function Preferences({ initial }) {
  const [form, setForm] = useState(initial);
  const action = useAcao();
  return <Card title="Preferências de comunicação"><form onSubmit={e => { e.preventDefault(); action.run('/notificacoes/preferencias', form, { metodo: 'PATCH', message: 'Preferências salvas.' }); }}>
    <Fields schema={[[ 'emailConvocacoes', 'Receber convocações por e-mail', 'checkbox'], ['emailSolicitacoes', 'Receber atualizações das solicitações por e-mail', 'checkbox'], ['emailEncaminhamentos', 'Receber avisos de prazos por e-mail', 'checkbox']]} value={form} onChange={setForm} disabled={action.busy}/>
    <ActionFeedback action={action}/><button disabled={action.busy}>Salvar preferências</button>
  </form></Card>;
}
