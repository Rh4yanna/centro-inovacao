import { formatarData } from './datas';
import { useRecurso } from './useRecurso';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { governanca } from '../../api/governanca';
import { useUsuario } from '../../auth/contexto';
import { podeEditar } from '../../auth/permissoes';
import { Card } from '../institutions/components';
import { Details, Fields, Heading, Remote } from './shared';
import { eventSchema } from './schemas';
import { Accreditation } from './Participation';
import { Documents } from './InstitutionArea';
import { ActivityWorkflow } from './ActivityWorkflow';

export function Events() {
  const resource = useRecurso('/eventos');
  const user = useUsuario();
  const [query,setQuery] = useState('');
  const [status,setStatus] = useState('');
  return <><Heading title="Eventos">Workshops, missões técnicas, palestras e atividades do ecossistema.</Heading>
    <Remote resource={resource}>{data => <Card><div className="section-heading"><h2>Agenda de eventos</h2>{podeEditar(user) && <Link className="button primary" to="/eventos/novo">Novo evento</Link>}</div><div className="governance-fields"><label>Buscar evento<input value={query} onChange={e => setQuery(e.target.value)}/></label><label>Status<select value={status} onChange={e => setStatus(e.target.value)}><option value="">Todos</option>{eventSchema.find(f => f[0] === 'status')[3].map(s => <option key={s}>{s}</option>)}</select></label></div><div className="table-scroll"><table><thead><tr><th>Evento</th><th>Data</th><th>Categoria</th><th>Status</th><th>Ações</th></tr></thead><tbody>{data.dados.filter(e => e.titulo.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')) && (!status || e.status === status)).map(e => <tr key={e.id}><td>{e.titulo}</td><td>{formatarData(e.data)}</td><td>{e.categoria}</td><td>{e.status}</td><td><Link to={`/eventos/${e.id}`}>Ver evento</Link></td></tr>)}</tbody></table></div>{!data.dados.length && <p className="empty">Nenhum evento cadastrado.</p>}</Card>}</Remote></>;
}

export function EventPage({ editing = false, creating = false }) {
  const {id} = useParams();
  const resource = useRecurso(creating ? '/eventos/configuracao' : `/eventos/${encodeURIComponent(id)}`);
  return <><Heading title={creating ? 'Novo evento' : editing ? 'Editar evento' : 'Evento'}/><Remote resource={resource}>{data => editing || creating ? <EventForm key={id || 'novo'} initial={creating ? {} : data.evento} id={id}/> : <EventDetail event={data.evento}/>}</Remote></>;
}

function EventForm({initial,id}) {
  const navigate = useNavigate();
  const [form,setForm] = useState({status:'rascunho',origem:'proprio',...initial});
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  async function save(e) {
    e.preventDefault(); setError('');
    if (!form.data || !form.horaInicio) return setError('Informe a data e o horário inicial.');
    if (form.horaFim && form.horaFim <= form.horaInicio) return setError('O horário final deve ser posterior ao inicial.');
    setBusy(true);
    try {
      const result = await governanca(id ? `/eventos/${encodeURIComponent(id)}` : '/eventos',{metodo:id ? 'PATCH' : 'POST',corpo:form});
      if (!result.evento?.id) throw new Error('O servidor não confirmou o evento salvo.');
      navigate(`/eventos/${result.evento.id}`);
    } catch(e) { setError(e.message); } finally { setBusy(false); }
  }
  return <form onSubmit={save}><Card title="Informações do evento"><Fields schema={eventSchema} value={form} onChange={setForm} disabled={busy}/></Card>{error && <p role="alert" className="error">{error}</p>}<div className="form-actions"><Link className="button" to="/eventos">Cancelar</Link><button className="primary" disabled={busy}>{busy ? 'Salvando...' : 'Salvar evento'}</button></div></form>;
}
function EventDetail({event}) {
  const user = useUsuario();
  return <><Card title={event.titulo}><Details schema={eventSchema} value={event}/>{podeEditar(user) && <Link className="button" to={`/eventos/${event.id}/editar`}>Editar evento</Link>}</Card><ActivityWorkflow scope={`eventos/${event.id}`}/><Accreditation kind="eventos" id={event.id}/><Documents scope={`eventos/${event.id}`}/><Link to="/eventos">Voltar aos eventos</Link></>;
}
