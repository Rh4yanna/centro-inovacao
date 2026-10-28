import { formatarData } from './datas';
import { useState } from 'react';
import { useUsuario } from '../../auth/contexto';
import { podeEditar } from '../../auth/permissoes';
import { Card, Modal } from '../institutions/components';
import { Fields, Remote } from './shared';
import { useRecurso } from './useRecurso';
import { useAcao } from './useAcao';
import { ActionFeedback } from './ActionFeedback';

export function ActivityWorkflow({ scope }) {
  const resource = useRecurso(`/${scope}/organizacao`);
  const user = useUsuario();
  return <Remote resource={resource}>{data => <>
    <Invitations scope={scope} data={data} canEdit={podeEditar(user)} reload={resource.reload}/>
    <Tasks scope={scope} data={data} canEdit={podeEditar(user)} reload={resource.reload}/>
  </>}</Remote>;
}

function Invitations({ scope, data, canEdit, reload }) {
  const [form, setForm] = useState({ assunto: '', mensagem: '', prazoResposta: '' });
  const [institutions, setInstitutions] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
  const action = useAcao();
  function review(e) {
    e.preventDefault();
    if (institutions.length) setConfirmation({ ...form, instituicoes: [...institutions], chaveOperacao: crypto.randomUUID() });
  }
  return <Card title="Convocações e confirmações"><ActionFeedback action={action}/>
    <div className="table-scroll"><table><thead><tr><th>Instituição</th><th>Convocação</th><th>Entrega do e-mail</th><th>Resposta</th><th>Representante</th></tr></thead><tbody>{(data.convocacoes || []).map(c => <tr key={c.id}><td>{c.instituicaoNome}</td><td>{formatarData(c.enviadaEm, true)}</td><td>{c.statusEntrega}</td><td>{c.resposta || 'Aguardando resposta'}</td><td>{c.representanteNome || '—'}</td></tr>)}</tbody></table></div>
    {!data.convocacoes?.length && <p>Nenhuma convocação registrada.</p>}
    {canEdit && <form onSubmit={review}><fieldset disabled={action.busy}><legend>Nova convocação</legend>
      <Fields schema={[[ 'assunto', 'Assunto', 'required'], ['mensagem', 'Mensagem', 'textarea'], ['prazoResposta', 'Prazo para resposta', 'datetime-local']]} value={form} onChange={setForm}/>
      <fieldset><legend>Instituições destinatárias</legend>{(data.instituicoes || []).map(i => <label className="consent" key={i.id}><input type="checkbox" checked={institutions.includes(i.id)} onChange={e => setInstitutions(values => e.target.checked ? [...values, i.id] : values.filter(id => id !== i.id))}/>{i.nome}</label>)}</fieldset>
      <button disabled={!institutions.length || !form.mensagem.trim()}>Revisar convocação</button>
    </fieldset></form>}
    {confirmation && <Modal title="Confirmar convocação" onClose={() => { if (!action.busy) setConfirmation(null); }}>
      <p>Enviar a convocação por e-mail para {confirmation.instituicoes.length} instituições?</p><ul>{(data.instituicoes || []).filter(i => confirmation.instituicoes.includes(i.id)).map(i => <li key={i.id}>{i.nome}</li>)}</ul>
      <h3>{confirmation.assunto}</h3><p className="preserve-lines">{confirmation.mensagem}</p><p>Prazo: {formatarData(confirmation.prazoResposta, true)}</p><ActionFeedback action={action}/>
      <button disabled={action.busy} onClick={() => setConfirmation(null)}>Cancelar</button><button className="primary" disabled={action.busy} onClick={() => action.run(`/${scope}/convocacoes`, confirmation, { message: 'Convocação registrada. Acompanhe a entrega dos e-mails na lista.', onSuccess: () => { setConfirmation(null); setInstitutions([]); reload(); } })}>Confirmar envio</button>
    </Modal>}
  </Card>;
}

function Tasks({ scope, data, canEdit, reload }) {
  const [editing, setEditing] = useState(null);
  const action = useAcao();
  function save(e) {
    e.preventDefault();
    const { id, titulo, descricao, responsavelId, prazo, status, resultado, versaoRegistro } = editing;
    action.run(`/${scope}/encaminhamentos${id ? `/${encodeURIComponent(id)}` : ''}`, { titulo, descricao, responsavelId, prazo, status, resultado, versaoRegistro }, { metodo: id ? 'PATCH' : 'POST', message: 'Encaminhamento salvo.', onSuccess: () => { setEditing(null); reload(); } });
  }
  return <Card title="Encaminhamentos"><ActionFeedback action={action}/>{canEdit && <button onClick={() => setEditing({ titulo: '', descricao: '', responsavelId: '', prazo: '', status: 'pendente', resultado: '' })}>Novo encaminhamento</button>}
    {(data.encaminhamentos || []).map(t => <article key={t.id} className="public-activity"><h3>{t.titulo}</h3><p>{t.descricao}</p><p>{t.responsavelNome} · Prazo: {formatarData(t.prazo)} · {t.status}</p>{t.resultado && <p>Resultado: {t.resultado}</p>}{canEdit && <button onClick={() => setEditing({ ...t })}>Editar encaminhamento</button>}</article>)}
    {!data.encaminhamentos?.length && <p>Nenhum encaminhamento registrado.</p>}
    {editing && <Modal title={editing.id ? 'Editar encaminhamento' : 'Novo encaminhamento'} onClose={() => { if (!action.busy) setEditing(null); }}><form onSubmit={save}><fieldset disabled={action.busy}>
      <Fields schema={[[ 'titulo', 'Título', 'required'], ['descricao', 'Descrição', 'textarea'], ['status', 'Situação', 'required', ['pendente', 'em_andamento', 'concluido', 'cancelado']]]} value={editing} onChange={setEditing}/>
      <label>Responsável<select required value={editing.responsavelId} onChange={e => setEditing({ ...editing, responsavelId: e.target.value })}><option value="">Selecione</option>{(data.responsaveis || []).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>
      <label>Prazo<input required type="date" value={editing.prazo} onChange={e => setEditing({ ...editing, prazo: e.target.value })}/></label>
      <label>Resultado ou motivo do cancelamento<textarea required={['concluido', 'cancelado'].includes(editing.status)} maxLength={5000} value={editing.resultado || ''} onChange={e => setEditing({ ...editing, resultado: e.target.value })}/></label>
      <ActionFeedback action={action}/><button className="primary">Salvar encaminhamento</button>
    </fieldset></form></Modal>}
  </Card>;
}

export function MyInvitations() {
  const resource = useRecurso('/minha-instituicao/convocacoes');
  const [selected, setSelected] = useState(null);
  const [answer, setAnswer] = useState({ resposta: 'confirmada', representanteId: '', justificativa: '' });
  const action = useAcao();
  return <Card title="Convocações da instituição"><ActionFeedback action={action}/><Remote resource={resource}>{data => <>
    {(data.dados || []).map(c => <article key={c.id} className="public-activity"><h3>{c.titulo}</h3><p>{formatarData(c.data)} · {c.local}</p><p>{c.mensagem}</p><p>Prazo de resposta: {formatarData(c.prazoResposta, true)} · {c.resposta || 'Aguardando resposta'}</p><button disabled={!c.podeResponder || action.busy} onClick={() => { setSelected(c); setAnswer({ resposta: c.resposta || 'confirmada', representanteId: c.representanteId || '', justificativa: c.justificativa || '' }); }}>Responder convocação</button></article>)}
    {!data.dados?.length && <p>Nenhuma convocação disponível.</p>}
    {selected && <Modal title="Responder convocação" onClose={() => { if (!action.busy) setSelected(null); }}><h3>{selected.titulo}</h3><form onSubmit={e => { e.preventDefault(); action.run(`/minha-instituicao/convocacoes/${encodeURIComponent(selected.id)}/resposta`, { ...answer, versaoRegistro: selected.versaoRegistro }, { message: 'Resposta registrada.', onSuccess: () => { setSelected(null); resource.reload(); } }); }}><fieldset disabled={action.busy}>
      <label>Resposta<select value={answer.resposta} onChange={e => setAnswer({ ...answer, resposta: e.target.value })}><option value="confirmada">Confirmar participação</option><option value="recusada">Informar ausência</option></select></label>
      <label>Representante<select required={answer.resposta === 'confirmada'} value={answer.representanteId} onChange={e => setAnswer({ ...answer, representanteId: e.target.value })}><option value="">Selecione</option>{(data.representantes || []).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>
      <label>Justificativa<textarea required={answer.resposta === 'recusada'} value={answer.justificativa} onChange={e => setAnswer({ ...answer, justificativa: e.target.value })}/></label>
      <ActionFeedback action={action}/><button className="primary">Enviar resposta</button>
    </fieldset></form></Modal>}
  </>}</Remote></Card>;
}

export function PresenceRequests({ onSaved }) {
  const resource = useRecurso('/minha-instituicao/presencas');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ statusPresenca: 'presente', modalidade: 'presencial', justificativa: '' });
  const action = useAcao();
  return <Card title="Correção de presença e justificativa de ausência"><ActionFeedback action={action}/><Remote resource={resource}>{data => <>
    {(data.dados || []).map(p => <article key={p.id} className="public-activity"><h3>{p.atividadeTitulo}</h3><p>{formatarData(p.data)} · {p.nome} · {p.statusPresenca}</p><button disabled={action.busy} onClick={() => { setSelected(p); setForm({ statusPresenca: p.statusPresenca || 'presente', modalidade: p.modalidade || 'presencial', justificativa: '' }); }}>Solicitar correção</button></article>)}
    {!data.dados?.length && <p>Nenhum registro de participação disponível.</p>}
    {selected && <Modal title="Solicitar correção de presença" onClose={() => { if (!action.busy) setSelected(null); }}><p>{selected.atividadeTitulo} · {selected.nome}</p><form onSubmit={e => { e.preventDefault(); action.run('/minha-instituicao/solicitacoes', { tipo: 'correcao_presenca', presencaId: selected.id, alteracoes: { statusPresenca: form.statusPresenca, modalidade: form.modalidade }, justificativa: form.justificativa }, { message: 'Solicitação enviada para análise. A presença oficial será alterada somente após aprovação.', onSuccess: () => { setSelected(null); resource.reload(); onSaved?.(); } }); }}><fieldset disabled={action.busy}>
      <Fields schema={[[ 'statusPresenca', 'Presença solicitada', 'required', ['presente', 'ausente', 'justificada']], ['modalidade', 'Modalidade', 'required', ['presencial', 'online']]]} value={form} onChange={setForm}/>
      <label>Justificativa<textarea required maxLength={2000} value={form.justificativa} onChange={e => setForm({ ...form, justificativa: e.target.value })}/></label><ActionFeedback action={action}/><button className="primary">Enviar solicitação</button>
    </fieldset></form></Modal>}
  </>}</Remote></Card>;
}
