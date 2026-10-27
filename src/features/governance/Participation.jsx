import { useRecurso } from './useRecurso';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { governanca, urlSegura } from '../../api/governanca';
import { useUsuario } from '../../auth/contexto';
import { podeEditar } from '../../auth/permissoes';
import { Card } from '../institutions/components';
import { Fields, Heading, Remote } from './shared';
import { Reports } from './InstitutionArea';
import OfflineAttendance from './OfflineAttendance';

export function Accreditation({kind,id}) {
  const resource = useRecurso(`/${kind}/${id}/credenciamento`);
  const user = useUsuario();
  const [form,setForm] = useState({inicio:'',fim:'',permiteConvidados:false});
  const [person,setPerson] = useState({pessoaId:'',instituicaoId:'',tipo:'representante',statusPresenca:'presente',modalidade:'presencial',justificativa:''});
  const [busy,setBusy] = useState(false); const [message,setMessage] = useState('');
  const [closing,setClosing] = useState(false);
  async function action(path,body) {
    setBusy(true); setMessage('');
    try { const r = await governanca(`/${kind}/${id}/${path}`,{metodo:'POST',corpo:body}); if(r.confirmado !== true) throw new Error('A operação não foi confirmada.'); setClosing(false); resource.reload(); }
    catch(e) {setMessage(e.message);} finally {setBusy(false);}
  }
  return <><Card title="Credenciamento e presença"><Remote resource={resource}>{data => <>
    <p>Situação: <strong>{data.status}</strong></p><p>{data.inicio} — {data.fim}</p>
    {podeEditar(user) && urlSegura(data.qrCodeUrl) && <img className="qr-code" src={urlSegura(data.qrCodeUrl)} alt="QR Code para confirmar presença"/>}
    {urlSegura(data.checkinUrl) && <a className="button" href={urlSegura(data.checkinUrl)}>Abrir check-in</a>}
    {podeEditar(user) && <>
      <form onSubmit={e => {e.preventDefault(); if(!form.inicio || !form.fim || form.fim <= form.inicio) return setMessage('Informe um período válido para o credenciamento.'); action('credenciamento/abrir',form);}}><h3>Período do check-in</h3><Fields schema={[[ 'inicio','Abertura','datetime-local'],['fim','Encerramento','datetime-local'],['permiteConvidados','Permitir convidados','checkbox']]} value={form} onChange={setForm} disabled={busy}/><button disabled={busy}>Abrir credenciamento e gerar QR Code</button></form>
      {data.status === 'aberto' && <button disabled={busy} onClick={() => setClosing(true)}>Encerrar credenciamento</button>}
      {closing && <div role="group" aria-label="Confirmar encerramento"><p>Encerrar o check-in desta atividade agora?</p><button disabled={busy} onClick={() => action('credenciamento/encerrar',{})}>Confirmar encerramento</button><button disabled={busy} onClick={() => setClosing(false)}>Cancelar</button></div>}
      <form onSubmit={e => {e.preventDefault(); action('presencas',person);}}><h3>Inclusão ou correção manual</h3><div className="governance-fields"><label>Participante<select required value={person.pessoaId} onChange={e => setPerson({...person,pessoaId:e.target.value})}><option value="">Selecione o participante</option>{(data.pessoas || []).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label><label>Instituição<select value={person.instituicaoId} onChange={e => setPerson({...person,instituicaoId:e.target.value})}><option value="">Sem instituição</option>{(data.instituicoes || []).map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}</select></label></div><Fields schema={[
        ['tipo','Representação','required',['representante','convidado','equipe']],['statusPresenca','Presença','required',['presente','ausente','justificada']],['modalidade','Modalidade','required',['presencial','online']],['justificativa','Justificativa da inclusão ou correção','required'],
      ]} value={person} onChange={setPerson} disabled={busy}/><button disabled={busy}>Registrar presença ou correção</button></form>
    </>}
    {podeEditar(user) && data.registroOfflineHabilitado === true && <OfflineAttendance scope={`${kind}/${id}`} person={person} people={data.pessoas} onSynced={resource.reload}/>}
    <p>{data.percentual == null ? 'Percentual de participação não disponível.' : `${data.percentual}% de participação`}</p>
    <div className="table-scroll"><table><thead><tr><th>Participante</th><th>Instituição</th><th>Tipo</th><th>Presença</th><th>Check-in</th></tr></thead><tbody>{(data.participantes || []).map(p => <tr key={p.id}><td>{p.nome}</td><td>{p.instituicao}</td><td>{p.tipo}</td><td>{p.statusPresenca}</td><td>{p.horarioCheckin || '—'}</td></tr>)}</tbody></table></div>
  </>}</Remote>{message && <p role="alert">{message}</p>}</Card>{podeEditar(user) && <Reports scope={`${kind}/${id}`}/>}</>;
}

export function Checkin() {
  const {token} = useParams();
  const resource = useRecurso(`/checkin/${encodeURIComponent(token)}`);
  return <main className="public-forum"><Link to="/dashboard">Fórum CTI</Link><Heading title="Confirmar presença"/><Remote resource={resource}>{data => <CheckinForm data={data} token={token}/>}</Remote></main>;
}
function CheckinForm({data,token}) {
  const [form,setForm] = useState({nome:data.participante?.nome || '',email:data.participante?.email || '',instituicaoId:data.participante?.instituicaoId || '',tipo:data.participante?.tipo || 'convidado',modalidade:'presencial',assinatura:''});
  const [busy,setBusy] = useState(false); const [message,setMessage] = useState(''); const [done,setDone] = useState(null);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      const r = await governanca(`/checkin/${encodeURIComponent(token)}`,{metodo:'POST',corpo:form});
      if(!r.presenca?.horarioCheckin) throw new Error('A presença não foi confirmada pelo servidor.'); setDone(r.presenca);
    } catch(e) {setMessage(e.message);} finally {setBusy(false);}
  }
  if(done) return <Card title="Presença confirmada"><p role="status">Registrada em {new Date(done.horarioCheckin).toLocaleString('pt-BR')}.</p><Link to="/dashboard">Voltar ao Fórum</Link></Card>;
  return <Card title={data.atividade.titulo}><p>{data.atividade.data} · {data.atividade.local}</p>{!data.aberto ? <p>O período de check-in está encerrado ou ainda não começou.</p> : !data.participante && !data.permiteConvidados ? <p>É necessário <Link to={`/login?retorno=${encodeURIComponent(`/checkin/${token}`)}`}>entrar na sua conta</Link> para registrar presença.</p> : <form onSubmit={submit}>
    {data.participante ? <p>Participante: <strong>{data.participante.nome}</strong></p> : <Fields schema={[[ 'nome','Nome completo','required'],['email','E-mail','email']]} value={form} onChange={setForm} disabled={busy}/>}
    <label>Instituição<select required={!!data.participante} value={form.instituicaoId} onChange={e => setForm({...form,instituicaoId:e.target.value})}><option value="">Convidado sem instituição</option>{(data.instituicoes || []).map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}</select></label>
    <Fields schema={[[ 'modalidade','Participação','required',['presencial','online']],['assinatura','Assinatura: digite seu nome completo','required']]} value={form} onChange={setForm} disabled={busy}/>
    <label className="consent"><input type="checkbox" required/> Confirmo minha participação e a veracidade dos dados informados.</label>
    {message && <p role="alert">{message}</p>}<button disabled={busy} className="primary">{busy ? 'Confirmando...' : 'Confirmar minha presença'}</button>
  </form>}</Card>;
}
