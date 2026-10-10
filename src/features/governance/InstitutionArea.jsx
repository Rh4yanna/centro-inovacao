import { useRecurso } from './useRecurso';
import { useState } from 'react';
import { governanca, urlSegura } from '../../api/governanca';
import { api } from '../../api/cliente';
import { useUsuario } from '../../auth/contexto';
import { podeEditar } from '../../auth/permissoes';
import { Card } from '../institutions/components';
import { Details, Fields, Heading, Remote } from './shared';
import { institutionSchema } from './schemas';

export function InstitutionArea() {
  const resource = useRecurso('/minha-instituicao');
  return <><Heading title="Minha instituição">Consulte seus dados, documentos e participação. Alterações são encaminhadas para análise.</Heading><Remote resource={resource}>{data => <>
    <InstitutionRequest initial={data.instituicao} onSaved={resource.reload}/>
    <Card title="Participação institucional"><p>{data.participacao?.percentual == null ? 'Percentual ainda não disponível.' : `${data.participacao.percentual}% de participação`}</p><p>{data.participacao?.descricao}</p>{(data.participacao?.atividades || []).map(a => <p key={`${a.tipo}-${a.id}`}>{a.data} · {a.titulo} · {a.status}</p>)}</Card>
    <Documents scope="minha-instituicao"/>
    <Card title="Minhas solicitações">{(data.solicitacoes || []).map(s => <article key={s.id}><h3>{s.tipo}</h3><p>{s.status} · {s.criadoEm}</p><p>{s.parecer}</p></article>)}{!data.solicitacoes?.length && <p>Nenhuma solicitação enviada.</p>}</Card>
    <Reports scope="minha-instituicao"/>
  </>}</Remote></>;
}
function InstitutionRequest({initial,onSaved}) {
  const [form,setForm] = useState(initial);
  const [reason,setReason] = useState('');
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      const alteracoes = Object.fromEntries(institutionSchema.map(([key]) => [key,form[key] ?? '']).filter(([key,value]) => value !== (initial[key] ?? '')));
      if (!Object.keys(alteracoes).length) throw new Error('Altere pelo menos um campo antes de enviar.');
      const r = await governanca('/minha-instituicao/solicitacoes',{metodo:'POST',corpo:{tipo:'alteracao_cadastral',alteracoes,justificativa:reason}});
      if (!r.solicitacao?.id) throw new Error('O envio não foi confirmado pelo servidor.');
      onSaved();
    } catch(e) { setMessage(e.message); } finally {setBusy(false);}
  }
  return <form onSubmit={submit}><Card title="Dados da instituição"><Fields schema={institutionSchema} value={form} onChange={setForm} disabled={busy}/><label>Justificativa da solicitação<textarea required maxLength={2000} value={reason} onChange={e => setReason(e.target.value)}/></label>{message && <p role="alert">{message}</p>}<button className="primary" disabled={busy}>{busy ? 'Enviando...' : 'Solicitar alteração'}</button></Card></form>;
}

export function Documents({scope}) {
  const resource = useRecurso(`/${scope}/documentos`);
  const types = scope.includes('instituic') ? ['logo','oficio','termo_adesao','material'] : ['convocacao','ata','foto','material','evidencia'];
  const [type,setType] = useState(types[0]);
  const [file,setFile] = useState(null);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  async function upload(e) {
    e.preventDefault(); setMessage('');
    if (!file || file.size > 10 * 1024 * 1024) return setMessage('Selecione um arquivo de até 10 MB.');
    if (!['application/pdf','image/png','image/jpeg'].includes(file.type)) return setMessage('Use PDF, PNG ou JPEG.');
    if (type === 'logo' && file.type === 'application/pdf') return setMessage('A logo deve ser PNG ou JPEG.');
    const body = new FormData(); body.append('arquivo',file); body.append('tipo',type);
    setBusy(true);
    try {
      const r = await api(`/api/governanca/${scope}/documentos`,{metodo:'POST',formData:body});
      if (r?.versao !== 1 || !r.documento?.id) throw new Error('O servidor não confirmou o recebimento do arquivo.');
      setMessage('Arquivo recebido. Consulte a situação na lista.'); resource.reload();
    } catch(e) {setMessage(e.message);} finally {setBusy(false);}
  }
  return <Card title="Logo e documentos"><Remote resource={resource}>{data => <>
    {(data.dados || []).map(d => <p key={d.id}>{d.nome} · {d.tipo} · versão {d.versaoArquivo} · {d.status} {urlSegura(d.downloadUrl) && <a href={urlSegura(d.downloadUrl)} target="_blank" rel="noreferrer">Baixar</a>}</p>)}{!data.dados?.length && <p>Nenhum documento cadastrado.</p>}
    {data.podeEnviar && <form onSubmit={upload}><div className="governance-fields"><label>Tipo de documento<select value={type} onChange={e => setType(e.target.value)}>{types.map(v => <option key={v}>{v}</option>)}</select></label><label>Arquivo (PDF, PNG ou JPEG; até 10 MB)<input required type="file" accept="application/pdf,image/png,image/jpeg" onChange={e => setFile(e.target.files?.[0] || null)}/></label></div><button disabled={busy}>{busy ? 'Enviando...' : 'Enviar arquivo'}</button></form>}
  </>}</Remote>{message && <p role="status">{message}</p>}</Card>;
}

export function Approvals() {
  const resource = useRecurso('/solicitacoes');
  const [message,setMessage] = useState('');
  const [busy,setBusy] = useState(false);
  const [selected,setSelected] = useState(null);
  const [reason,setReason] = useState('');
  async function decide(e) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      const r = await governanca(`/solicitacoes/${encodeURIComponent(selected.id)}/decisao`,{metodo:'POST',corpo:{decisao:selected.decisao,parecer:reason,versaoRegistro:selected.versaoRegistro}});
      if (!r.solicitacao?.id) throw new Error('A decisão não foi confirmada.');
      setSelected(null); setReason(''); resource.reload();
    } catch(e) {setMessage(e.message);} finally {setBusy(false);}
  }
  return <><Heading title="Solicitações e aprovações">Revise alterações antes de atualizar os registros oficiais.</Heading>{message && <p role="alert">{message}</p>}<Remote resource={resource}>{data => <>{data.dados.map(s => <Card key={s.id} title={s.instituicaoNome}><p>{s.tipo} · {s.status}</p><p>{s.justificativa}</p><Details schema={Object.keys(s.alteracoes || {}).map(k => [k,institutionSchema.find(f => f[0] === k)?.[1] || k])} value={s.alteracoes || {}}/>{s.status === 'pendente' && <div className="form-actions"><button disabled={busy} onClick={() => setSelected({...s,decisao:'rejeitar'})}>Solicitar ajustes</button><button disabled={busy} className="primary" onClick={() => setSelected({...s,decisao:'aprovar'})}>Aprovar</button></div>}</Card>)}{!data.dados.length && <Card><p>Nenhuma solicitação pendente.</p></Card>}</>}</Remote>
    {selected && <Card title="Confirmar decisão"><form onSubmit={decide}><p>{selected.decisao === 'aprovar' ? 'Aprovar as alterações de' : 'Solicitar ajustes para'} {selected.instituicaoNome}?</p><label>Parecer<textarea required value={reason} onChange={e => setReason(e.target.value)}/></label><button type="button" disabled={busy} onClick={() => setSelected(null)}>Cancelar</button><button disabled={busy} className="primary">Confirmar decisão</button></form></Card>}
  </>;
}

export function Reports({scope}) {
  const [start,setStart] = useState(''); const [end,setEnd] = useState('');
  const [message,setMessage] = useState(''); const [busy,setBusy] = useState(false);
  const [url,setUrl] = useState(null);
  async function generate(e) {
    e.preventDefault(); setMessage(''); setUrl(null); setBusy(true);
    try {
      const r = await governanca(`/${scope}/relatorios`,{metodo:'POST',corpo:{inicio:start,fim:end,formato:new FormData(e.currentTarget).get('formato')}});
      const link = urlSegura(r.downloadUrl); if(!link) throw new Error('O relatório não foi disponibilizado.'); setUrl(link);
    } catch(e) {setMessage(e.message);} finally {setBusy(false);}
  }
  return <Card title="Relatórios"><form onSubmit={generate}><div className="governance-fields"><label>Início<input required type="date" value={start} onChange={e => setStart(e.target.value)}/></label><label>Fim<input required type="date" min={start} value={end} onChange={e => setEnd(e.target.value)}/></label><label>Formato<select name="formato"><option value="xlsx">Excel (.xlsx)</option><option value="pdf">PDF</option></select></label></div><button disabled={busy}>{busy ? 'Gerando...' : 'Gerar relatório'}</button></form>{message && <p role="alert">{message}</p>}{url && <a className="button" href={url} target="_blank" rel="noreferrer">Baixar relatório</a>}</Card>;
}

export function GovernanceEditor({scope,schema,title}) {
  const resource = useRecurso(`/${scope}/governanca`);
  return <Card title={title}><Remote resource={resource}>{data => <MetadataForm key={JSON.stringify(data.registro)} initial={data.registro} schema={schema} scope={scope}/>}</Remote></Card>;
}
function MetadataForm({initial,schema,scope}) {
  const user = useUsuario(); const [form,setForm] = useState(initial); const [message,setMessage] = useState(''); const [busy,setBusy] = useState(false);
  if (!podeEditar(user) || (user?.papel === 'diretoria' && scope.startsWith('instituicoes/'))) return <Details schema={schema} value={initial}/>;
  async function save(e) {
    e.preventDefault(); setBusy(true); setMessage('');
    try { const r = await governanca(`/${scope}/governanca`,{metodo:'PATCH',corpo:form}); if(!r.registro) throw new Error('A gravação não foi confirmada.'); setForm(r.registro); setMessage('Dados salvos.'); } catch(e) {setMessage(e.message);} finally {setBusy(false);}
  }
  return <form onSubmit={save}><Fields schema={schema} value={form} onChange={setForm} disabled={busy}/>{message && <p role="status">{message}</p>}<button disabled={busy}>Salvar dados de governança</button></form>;
}
