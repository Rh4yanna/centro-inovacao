import { useState } from 'react';
import { Card } from '../institutions/components';
import { Heading, Remote } from './shared';
import { useRecurso } from './useRecurso';
import { useAcao } from './useAcao';
import { ActionFeedback } from './ActionFeedback';

export default function Audit() {
  const [form, setForm] = useState({ inicio: '', fim: '', recurso: '', autor: '' });
  const [filters, setFilters] = useState({});
  const [cursors, setCursors] = useState(['']);
  const [error, setError] = useState('');
  const query = new URLSearchParams({ ...filters, cursor: cursors.at(-1), limite: '25' });
  const resource = useRecurso(`/auditoria?${query}`);
  function search(e) {
    e.preventDefault(); setError('');
    if (form.inicio && form.fim && form.fim < form.inicio) return setError('O período informado é inválido.');
    setFilters(Object.fromEntries(Object.entries(form).filter(([, v]) => v))); setCursors(['']);
  }
  return <><Heading title="Histórico de alterações">Consulte quem alterou os registros, quando e quais dados foram modificados.</Heading>
    <Card title="Filtros"><form onSubmit={search}><div className="governance-fields">
      <label>Data inicial<input type="date" value={form.inicio} onChange={e => setForm({ ...form, inicio: e.target.value })}/></label>
      <label>Data final<input type="date" min={form.inicio} value={form.fim} onChange={e => setForm({ ...form, fim: e.target.value })}/></label>
      <label>Recurso<select value={form.recurso} onChange={e => setForm({ ...form, recurso: e.target.value })}><option value="">Todos</option>{['instituicoes', 'representantes', 'reunioes', 'eventos', 'presencas', 'documentos', 'contas', 'solicitacoes', 'importacoes'].map(v => <option key={v}>{v}</option>)}</select></label>
      <label>Nome do autor<input value={form.autor} onChange={e => setForm({ ...form, autor: e.target.value })}/></label>
    </div>{error && <p role="alert">{error}</p>}<button>Aplicar filtros</button></form></Card>
    <Remote resource={resource}>{data => <Card title="Registros de auditoria">{(data.dados || []).map(item => <details key={item.id} className="audit-entry"><summary>{item.criadoEm} · {item.autorNome} · {item.acao} · {item.recursoNome || item.recurso}</summary><p>{item.justificativa}</p><div className="governance-columns"><div><h3>Antes</h3><pre>{JSON.stringify(item.antes ?? null, null, 2)}</pre></div><div><h3>Depois</h3><pre>{JSON.stringify(item.depois ?? null, null, 2)}</pre></div></div></details>)}
      {!data.dados?.length && <p>Nenhuma alteração encontrada.</p>}
      <div className="pagination"><button disabled={cursors.length === 1} onClick={() => setCursors(c => c.slice(0, -1))}>Anterior</button><span>Página {cursors.length}</span><button disabled={!data.proximoCursor || cursors.includes(data.proximoCursor)} onClick={() => setCursors(c => [...c, data.proximoCursor])}>Próxima</button></div>
    </Card>}</Remote></>;
}

export function InternalNotes({ institutionId }) {
  const path = `/instituicoes/${encodeURIComponent(institutionId)}/observacoes`;
  const resource = useRecurso(path);
  const action = useAcao();
  const [text, setText] = useState('');
  return <Card title="Observações internas"><p>Visíveis somente à administração e à Diretoria.</p><ActionFeedback action={action}/>
    <Remote resource={resource}>{data => <>
      {(data.dados || []).map(n => <article key={n.id}><p className="preserve-lines">{n.texto}</p><small>{n.autorNome} · {n.criadoEm}</small></article>)}
      {!data.dados?.length && <p>Nenhuma observação registrada.</p>}
      <form onSubmit={e => { e.preventDefault(); if (text.trim()) action.run(path, { texto: text.trim() }, { message: 'Observação registrada.', onSuccess: () => { setText(''); resource.reload(); } }); }}><label>Nova observação<textarea required maxLength={5000} value={text} onChange={e => setText(e.target.value)}/></label><button disabled={action.busy || !text.trim()}>Adicionar observação</button></form>
    </>}</Remote></Card>;
}
