import { useRecurso } from './useRecurso';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../institutions/components';
import { urlSegura } from '../../api/governanca';
import { Heading, Remote } from './shared';

export default function PublicDashboard() {
  const resource = useRecurso('/publico');
  const [filters, setFilters] = useState({ busca: '', tipo: '', vertente: '', area: '' });
  return <main className="public-forum">
    <nav className="public-nav"><Link to="/dashboard">Fórum CTI · Guarapuava</Link><Link className="button primary" to="/login">Acessar minha conta</Link></nav>
    <Heading title="Ciência, tecnologia e inovação">Conheça as instituições e acompanhe as atividades do Fórum CTI.</Heading>
    <Remote resource={resource}>{data => <>
      <div className="public-stats">{[['Instituições integrantes',data.indicadores?.instituicoes],['Reuniões realizadas',data.indicadores?.reunioes],['Eventos realizados',data.indicadores?.eventos],['Participação geral',data.indicadores?.participacao == null ? null : `${data.indicadores.participacao}%`]].map(([label,value]) => <Card key={label}><span>{label}</span><strong>{value ?? 'Não informado'}</strong></Card>)}</div>
      <Card title="Instituições integrantes"><div className="governance-fields"><label>Buscar instituição<input value={filters.busca} onChange={e => setFilters({...filters,busca:e.target.value})}/></label>{['tipo','vertente','area'].map(key => <label key={key}>{{tipo:'Tipo',vertente:'Vertente',area:'Área de atuação'}[key]}<select value={filters[key]} onChange={e => setFilters({...filters,[key]:e.target.value})}><option value="">Todas</option>{[...new Set((data.instituicoes || []).map(i => i[key]).filter(Boolean))].map(v => <option key={v}>{v}</option>)}</select></label>)}</div>
        <div className="public-institutions">{(data.instituicoes || []).filter(i => i.autorizaDivulgacao === true && i.nome.toLocaleLowerCase('pt-BR').includes(filters.busca.toLocaleLowerCase('pt-BR')) && ['tipo','vertente','area'].every(key => !filters[key] || filters[key] === i[key])).map(i => <article key={i.id}>{urlSegura(i.logoUrl) && <img src={urlSegura(i.logoUrl)} alt={`Logo de ${i.nome}`} loading="lazy"/>}<h3>{i.nome}</h3><p>{[i.tipo,i.vertente,i.area].filter(Boolean).join(' · ')}</p></article>)}</div>
        {!(data.instituicoes || []).length && <p className="empty">Nenhuma instituição divulgada.</p>}
      </Card>
      <div className="governance-columns"><Card title="Calendário unificado">{(data.calendario || []).map(a => <article className="public-activity" key={`${a.tipo}-${a.id}`}><small>{a.data} · {a.tipo}</small><h3>{a.titulo}</h3><p>{a.local}</p>{urlSegura(a.inscricaoUrl) && <a href={urlSegura(a.inscricaoUrl)} target="_blank" rel="noreferrer">Inscrição e informações</a>}</article>)}{!data.calendario?.length && <p>Nenhuma atividade pública agendada.</p>}</Card>
        <Card title="Diretoria">{(data.diretoria || []).map(p => <p key={p.id}><strong>{p.nome}</strong><br/>{p.cargo} · {p.instituicao}</p>)}{!data.diretoria?.length && <p>Composição ainda não divulgada.</p>}</Card></div>
      <Card title="Documentos públicos e canais oficiais">{[...(data.documentos || []),...(data.canais || [])].filter(d => urlSegura(d.url)).map((d,index) => <p key={index}><a href={urlSegura(d.url)} target="_blank" rel="noreferrer">{d.titulo}</a></p>)}{urlSegura(data.interesseUrl) && <a className="button" href={urlSegura(data.interesseUrl)}>Manifestar interesse em participar</a>}</Card>
    </>}</Remote>
  </main>;
}
