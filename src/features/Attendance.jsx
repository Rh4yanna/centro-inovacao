import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { reunioes } from '../api/recursos';
import { useColecao } from '../api/useColecao';
import { Card } from './institutions/components';

export function Attendance({ meetingId, institutionId, personId }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [institution, setInstitution] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [page, setPage] = useState(1);
  const load = useCallback(async () => {
    const meetings = meetingId ? [await reunioes.obter(meetingId)] : await reunioes.listar();
    const rows = [];
    // Keep requests bounded when loading a complete history.
    for (let n = 0; n < meetings.length; n += 4) {
      const batches = await Promise.all(meetings.slice(n,n+4).map(async m => {
        const response = await reunioes.participantes(m.id);
        return (response.dados || []).map((p,index) => ({...p,meeting:m,key:`${m.id}-${p.presencaId || p.conviteId || index}`}));
      }));
      rows.push(...batches.flat());
    }
    return rows.filter(r => (!institutionId || r.instituicaoId === institutionId) && (!personId || r.pessoaId === personId));
  }, [meetingId,institutionId,personId]);
  const {itens,carregando,erro,recarregar} = useColecao(load);
  const filtered = itens.filter(r => `${r.nome} ${r.meeting.name}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')) && (!status || (status === 'convidado' ? r.tipo === status : r.statusPresenca === status)) && (!institution || r.instituicao === institution) && (!start || r.meeting.date >= start) && (!end || r.meeting.date <= end));
  const current = Math.min(page, Math.max(1,Math.ceil(filtered.length / 10)));
  return <Card title={meetingId ? 'Lista de presença' : 'Histórico de participação'}>
    <div className="filters meeting-filters">
      <label>Buscar participante ou reunião<input value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}} placeholder="Digite o nome"/></label>
      <label>Presença<select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="">Todos</option><option value="presente">Presente</option><option value="ausente">Ausente</option><option value="convidado">Convidado</option></select></label>
      <label>Instituição<select value={institution} onChange={e=>{setInstitution(e.target.value);setPage(1);}}><option value="">Todas</option>{[...new Set(itens.map(r=>r.instituicao).filter(Boolean))].map(v=><option key={v}>{v}</option>)}</select></label>
      <label>Data inicial<input type="date" value={start} onChange={e=>{setStart(e.target.value);setPage(1);}}/></label>
      <label>Data final<input type="date" min={start} value={end} onChange={e=>{setEnd(e.target.value);setPage(1);}}/></label>
    </div>
    <button onClick={()=>{setQuery('');setStatus('');setInstitution('');setStart('');setEnd('');setPage(1);}}>Limpar filtros</button>
    {carregando ? <p role="status" className="empty">Carregando participações...</p> : erro ? <div role="alert"><p className="error">{erro}</p><button onClick={recarregar}>Tentar novamente</button></div> : <>
      <p className="muted">{filtered.length} registros · {filtered.filter(r=>r.statusPresenca==='presente').length} presenças · {filtered.filter(r=>r.statusPresenca==='ausente').length} ausências</p>
      <div className="table-scroll"><table><thead><tr>{['Data','Reunião','Participante','Instituição','Tipo','Presença','Check-in'].map(v=><th key={v}>{v}</th>)}</tr></thead><tbody>{filtered.slice((current-1)*10,current*10).map(r=><tr key={r.key}><td>{new Date(r.meeting.date+'T12:00:00').toLocaleDateString('pt-BR')}</td><td><Link className="purple" to={`/reunioes/${r.meeting.id}`}>{r.meeting.name}</Link></td><td>{r.nome}</td><td>{r.instituicao || 'Não informada'}</td><td>{r.tipo==='convidado'?'Convidado':'Representante'}</td><td>{({presente:'Presente',ausente:'Ausente'})[r.statusPresenca] || 'Não registrada'}</td><td>{r.horarioCheckin ? new Date(r.horarioCheckin).toLocaleString('pt-BR') : '—'}</td></tr>)}</tbody></table></div>
      {!filtered.length && <p className="empty">Nenhuma participação encontrada para os filtros selecionados.</p>}
      <footer className="pagination"><small>{filtered.length} registros</small><div><button disabled={current===1} onClick={()=>setPage(current-1)}>Anterior</button><span>Página {current}</span><button disabled={current*10>=filtered.length} onClick={()=>setPage(current+1)}>Próxima</button></div></footer>
    </>}
  </Card>;
}
