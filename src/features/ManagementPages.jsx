import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, Filter, Search, ArrowRight } from 'lucide-react';
import { Card, Field, Badge } from './institutions/components';
import { states } from './institutions/data';

function Heading({ title, children }) { return <header className="page-heading"><h1>{title}</h1><p>{children}</p></header>; }
function Pager({ count, page, setPage, noun }) {
  const pages = Math.max(1, Math.ceil(count / 10));
  return <footer className="pagination"><small>Mostrando {count ? (page - 1) * 10 + 1 : 0} a {Math.min(page * 10, count)} de {count} {noun}</small><div><button disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Página anterior">‹</button><span>{page} de {pages}</span><button disabled={page === pages} onClick={() => setPage(page + 1)} aria-label="Próxima página">›</button></div></footer>;
}
export function Representatives({ representatives, institutions }) {
  const [query, setQuery] = useState(''); const [role, setRole] = useState(''); const [status, setStatus] = useState(''); const [page, setPage] = useState(1);
  const filtered = representatives.filter(r => `${r.name} ${r.email}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')) && (!role || role === r.role) && (!status || status === r.status));
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / 10)));
  return <><Heading title="Representantes">Consulte e gerencie os representantes de todas as instituições do ecossistema.</Heading><Card><div className="section-heading"><h2>Busca e filtros</h2><Link className="button primary" to="/representantes/novo">+ Adicionar representante</Link></div><div className="filters people-filters"><label>Buscar representante<div className="input-icon"><Search /><input placeholder="Digite o nome ou e-mail" value={query} onChange={e => {setQuery(e.target.value); setPage(1);}} /></div></label><label>Cargo / Função<select value={role} onChange={e => {setRole(e.target.value); setPage(1);}}><option value="">Todos</option>{[...new Set(representatives.map(r => r.role))].map(v => <option key={v}>{v}</option>)}</select></label><label>Status<select value={status} onChange={e => {setStatus(e.target.value); setPage(1);}}><option value="">Todos</option><option>Ativo</option><option>Inativo</option></select></label><button className="neutral" onClick={() => {setQuery(''); setRole(''); setStatus(''); setPage(1);}}><Filter />Limpar filtros</button></div><div className="table-scroll"><table><thead><tr>{['Representante e Cargo','Instituição','E-mail','Telefone','Status','Ações'].map(v => <th key={v}>{v}</th>)}</tr></thead><tbody>{filtered.slice((current-1)*10,current*10).map(r => {const institution = institutions.find(i => i.id === r.institutionId); return <tr key={r.id}><td><div className="person-cell"><span className="avatar">{r.name.split(' ').filter(Boolean).map(v => v[0]).filter((_,i,a) => i === 0 || i === a.length-1).join('')}</span><div><strong>{r.name}</strong><small>{r.role}</small></div></div></td><td><strong>{institution?.name || r.institutionName || 'Sem vínculo'}</strong><small>{institution?.type}</small></td><td>{r.email}</td><td>{r.phone}</td><td><Badge status={r.status}/></td><td><Link className="icon-button" aria-label={`Ver ${r.name}`} to={`/representantes/${r.id}`}><Eye/></Link></td></tr>;})}</tbody></table>{!filtered.length && <p className="empty">Nenhum representante encontrado.</p>}</div></Card><Pager count={filtered.length} page={current} setPage={setPage} noun="representantes"/></>;
}
const emptyPerson = {name:'',cpf:'',email:'',status:'',phone:'',institutionId:'',role:'',street:'',number:'',neighborhood:'',city:'',state:'',zip:'',complement:''};
export function RepresentativeForm({ representatives, institutions, onSave }) {
  const {id} = useParams(); const navigate = useNavigate(); const existing = representatives.find(r => r.id === id);
  const [form,setForm] = useState(existing || emptyPerson); const [error,setError] = useState('');
  const [enviando,setEnviando] = useState(false);
  if(id && !existing) return <Card title="Representante não encontrado"><Link to="/representantes">Voltar</Link></Card>;
  const field = (name,label,options={}) => <Field name={name} label={label} value={form[name]} onChange={e => setForm({...form,[name]:e.target.value})} className="span-2" {...options}/>;
  async function submit(e) {
    e.preventDefault(); setError('');
    if(!form.name.trim() || !form.role.trim()) return setError('Preencha o nome e o cargo.');
    if(form.cpf.replace(/\D/g,'').length !== 11) return setError('Informe um CPF com 11 dígitos.');
    if(!institutions.some(i => i.id === form.institutionId)) return setError('Selecione uma instituição disponível.');
    setEnviando(true);
    const r = await onSave({...form,name:form.name.trim(),role:form.role.trim(),id});
    if(r === true) return navigate('/representantes');
    setEnviando(false);
    if(r?.campos?.length) setError(r.campos.map(c => c.mensagem).join(' '));
  }
  return <><Heading title={id ? 'Editar representante' : 'Adicionar representante'}>Preencha as informações para cadastrar um representante no ecossistema.</Heading><form onSubmit={submit}><Card title="Dados pessoais"><div className="form-grid">{field('name','Nome completo',{required:true,className:'span-4',placeholder:'Digite o nome completo do representante'})}{field('cpf','CPF',{required:true,placeholder:'000.000.000-00'})}{field('email','E-mail',{required:true,type:'email',placeholder:'exemplo@email.com.br'})}{field('status','Status',{required:true,options:['Ativo','Inativo']})}{field('phone','Telefone',{required:true,type:'tel',placeholder:'(00) 00000-0000'})}</div></Card><Card title="Instituição"><div className="form-grid"><label className="span-4">Instituição <span className="required">*</span><select required value={form.institutionId} onChange={e => setForm({...form,institutionId:e.target.value})}><option value="">Buscar instituição</option>{institutions.map(i => <option value={i.id} key={i.id}>{i.name}</option>)}</select></label>{field('role','Cargo / Função',{required:true,className:'span-3',placeholder:'Digite a função'})}</div></Card><Card title="Endereço"><div className="form-grid">{field('street','Logradouro',{className:'span-4',placeholder:'Digite o logradouro'})}{field('number','Número')}{field('neighborhood','Bairro')}{field('city','Cidade')}{field('state','Estado',{options:states})}{field('zip','CEP',{placeholder:'00000-000'})}{field('complement','Complemento',{className:'span-4',placeholder:'Sala, bloco, andar, etc.'})}</div></Card>{error && <p role="alert" className="error">{error}</p>}<div className="form-actions"><Link className="button" to="/representantes">Cancelar</Link><button className="primary" disabled={enviando}>{enviando ? 'Salvando...' : id ? 'Salvar alterações' : 'Cadastrar representante'}</button></div></form></>;
}
export function RepresentativeDetail({ representatives, institutions }) {
  const {id} = useParams(); const person = representatives.find(r => r.id === id);
  if(!person) return <Card title="Representante não encontrado"><Link to="/representantes">Voltar</Link></Card>;
  const institution = institutions.find(i => i.id === person.institutionId);
  return <><Heading title={person.name}>{person.role}</Heading><Card title="Dados pessoais"><dl className="info-grid">{[['CPF',person.cpf],['E-mail',person.email],['Telefone',person.phone],['Status',person.status],['Instituição',institution?.name || person.institutionName],['Endereço',[person.street,person.number,person.city,person.state].filter(Boolean).join(', ')]].map(([k,v]) => <div key={k}><dt>{k}</dt><dd>{v || 'Não informado'}</dd></div>)}</dl></Card><div className="form-actions"><Link className="button" to="/representantes">Voltar</Link><Link className="button primary" to={`/representantes/${id}/editar`}>Editar representante</Link></div></>;
}
export function MeetingTable({ meetings }) {
  return <div className="table-scroll"><table className="meetings-table"><thead><tr>{['Data','Reunião','Horário','Local','Participantes','Status','Ações'].map(v => <th key={v}>{v}</th>)}</tr></thead><tbody>{meetings.map(m => <tr key={m.id}><td><span className="date-badge" title={m.date}>{m.date.slice(8)}<small>{new Date(m.date+'T12:00:00').toLocaleDateString('pt-BR',{month:'short'}).replace('.','').toUpperCase()}</small></span></td><td><strong>{m.name}</strong><small>{m.description}</small></td><td>{m.time}</td><td><strong>{m.place}</strong><small>{m.address}</small></td><td className="purple">{m.count} {m.status === 'Agendada' ? 'confirmados' : 'participantes'}</td><td><Badge status={m.status}/></td><td><Link className="button" to={`/reunioes/${m.id}`}>Ver reunião <ArrowRight/></Link></td></tr>)}</tbody></table>{!meetings.length && <p className="empty">Nenhuma reunião encontrada.</p>}</div>;
}
export function Meetings({ meetings }) {
  const [query,setQuery]=useState(''); const [status,setStatus]=useState(''); const [start,setStart]=useState(''); const [end,setEnd]=useState(''); const [page,setPage]=useState(1);
  const filtered = meetings.filter(m => `${m.name} ${m.place} ${m.address || ''} ${m.organizer || ''}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')) && (!status || m.status===status) && (!start || m.date>=start) && (!end || m.date<=end));
  const current=Math.min(page,Math.max(1,Math.ceil(filtered.length/10)));
  return <><Heading title="Reuniões">Consulte todas as reuniões do ecossistema, realizadas e agendadas.</Heading><Card><div className="section-heading"><h2>Busca e filtros</h2><Link className="button primary" to="/reunioes/nova">+ Nova reunião</Link></div><div className="filters meeting-filters"><label>Buscar reunião<div className="input-icon"><Search/><input placeholder="Digite o título, local ou organizador" value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}}/></div></label><label>Status<select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="">Todos</option>{['Agendada','Realizada','Cancelada'].map(v=><option key={v}>{v}</option>)}</select></label><label>Data inicial<input type="date" value={start} onChange={e=>{setStart(e.target.value);setPage(1);}}/></label><label>Data final<input type="date" min={start} value={end} onChange={e=>{setEnd(e.target.value);setPage(1);}}/></label><button className="neutral" onClick={()=>{setQuery('');setStatus('');setStart('');setEnd('');setPage(1);}}><Filter/>Limpar filtros</button></div>{start && end && end < start ? <p role="alert" className="error">A data final deve ser posterior à inicial.</p> : <MeetingTable meetings={filtered.slice((current-1)*10,current*10)}/>}</Card><Pager count={filtered.length} page={current} setPage={setPage} noun="reuniões"/></>;
}
export function MeetingForm({ meetings, onSave }) {
  const {id}=useParams(); const navigate=useNavigate(); const existing=meetings.find(m=>m.id===id);
  const [form,setForm]=useState(existing || {name:'',date:'',time:'',place:'',description:'',link:'',password:''}); const [error,setError]=useState('');
  const [enviando,setEnviando]=useState(false);
  if(id && !existing) return <Card title="Reunião não encontrada"><Link to="/reunioes">Voltar</Link></Card>;
  const field=(name,label,options={})=><Field name={name} label={label} value={form[name] || ''} onChange={e=>setForm({...form,[name]:e.target.value})} className="span-2" {...options}/>;
  async function submit(e) {
    e.preventDefault(); setError('');
    if(!form.name.trim() || !form.place.trim() || !form.description.trim()) return setError('Preencha o título, o local e a descrição.');
    if(form.link && !/^https?:\/\//i.test(form.link)) return setError('O link deve começar com https:// ou http://.');
    setEnviando(true);
    const r = await onSave({...form,name:form.name.trim(),id});
    if(r === true) return navigate('/reunioes');
    setEnviando(false);
    if(r?.campos?.length) setError(r.campos.map(c => c.mensagem).join(' '));
  }
  return <><Heading title={id ? 'Editar reunião' : 'Nova reunião'}>Preencha as informações para cadastrar uma nova reunião no ecossistema.</Heading><form onSubmit={submit}><Card title="Informações gerais"><div className="form-grid">{field('name','Título da reunião',{required:true,className:'span-4',placeholder:'Digite o título da reunião'})}{field('date','Data da reunião',{required:true,type:'date'})}{field('time','Horário',{required:true,type:'time'})}{field('place','Local',{required:true,placeholder:'Digite o local da reunião'})}<label className="span-10">Descrição <span className="required">*</span><textarea required maxLength={200} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Descreva brevemente a reunião e seus objetivos."/><small className="character-count">{form.description.length}/200</small></label>{field('link','Link da reunião (Google Meet, Zoom, Teams, etc.)',{type:'url',className:'span-4',placeholder:'https://'})}{field('password','Senha de acesso',{className:'span-3',placeholder:'Digite a senha de acesso'})}</div></Card>{error && <p role="alert" className="error">{error}</p>}<div className="form-actions"><Link className="button" to="/reunioes">Cancelar</Link><button className="primary" disabled={enviando}>{enviando ? 'Salvando...' : id ? 'Salvar alterações' : 'Cadastrar reunião'}</button></div></form></>;
}
export function MeetingDetail({ meetings }) {
  const {id}=useParams(); const m=meetings.find(m=>m.id===id);
  if(!m) return <Card title="Reunião não encontrada"><Link to="/reunioes">Voltar</Link></Card>;
  return <><Heading title={m.name}>{m.description}</Heading><Card title="Informações gerais"><dl className="info-grid">{[['Data',new Date(m.date+'T12:00:00').toLocaleDateString('pt-BR')],['Horário',m.time],['Local',m.place],['Participantes confirmados',String(m.count)],['Senha de acesso',m.password]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v || 'Não informado'}</dd></div>)}<div><dt>Status</dt><dd><Badge status={m.status}/></dd></div>{/^https?:\/\//i.test(m.link || '') && <div><dt>Link da reunião</dt><dd><a className="purple" href={m.link} target="_blank" rel="noreferrer">Acessar reunião</a></dd></div>}</dl></Card><div className="form-actions"><Link className="button" to="/reunioes">Voltar</Link><Link className="button primary" to={`/reunioes/${id}/editar`}>Editar reunião</Link></div></>;
}
