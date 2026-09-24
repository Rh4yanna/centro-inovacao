import { useCallback, useState } from 'react';
import { representantes } from '../api/recursos';
import { useColecao } from '../api/useColecao';
import { Card, Modal } from './institutions/components';
import { Permissao } from '../auth/Permissao';

export function Links({ personId, institutions }) {
  const load = useCallback(async () => (await representantes.obter(personId)).vinculos || [],[personId]);
  const {itens,carregando,erro,recarregar} = useColecao(load);
  const [institutionId,setInstitutionId] = useState('');
  const [cargo,setCargo] = useState('');
  const [ending,setEnding] = useState(null);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  async function save(action) {
    if(busy) return;
    setBusy(true);setMessage('');
    try {await action();setEnding(null);setInstitutionId('');setCargo('');await recarregar();setMessage('Vínculos atualizados.');}
    catch(e){setMessage(e.message);}
    finally {setBusy(false);}
  }
  return <Card title="Vínculos com instituições">
    {message && <p role="status">{message}</p>}
    {carregando ? <p>Carregando vínculos...</p> : erro ? <div role="alert">{erro}<button onClick={recarregar}>Tentar novamente</button></div> : <>
      <div className="table-scroll"><table><thead><tr><th>Instituição</th><th>Cargo</th><th>Início</th><th>Fim</th><th>Status</th><th>Ações</th></tr></thead><tbody>{itens.map(v=><tr key={v.vinculoId}><td>{v.instituicao}</td><td>{v.cargo || 'Não informado'}</td><td>{v.dataInicio || '—'}</td><td>{v.dataFim || '—'}</td><td>{v.status==='ativo'?'Ativo':'Encerrado'}</td><td>{v.status==='ativo' && <Permissao><button disabled={busy} onClick={()=>setEnding(v)}>Encerrar vínculo</button></Permissao>}</td></tr>)}</tbody></table></div>
      {!itens.length && <p className="empty">Nenhum vínculo cadastrado.</p>}
    </>}
    <Permissao><form onSubmit={e=>{e.preventDefault();save(()=>representantes.criarVinculo(personId,institutionId,cargo.trim()));}}><div className="two-columns meeting-fields"><label>Instituição<select required value={institutionId} onChange={e=>setInstitutionId(e.target.value)}><option value="">Selecione</option>{institutions.filter(i=>!itens.some(v=>v.instituicaoId===i.id && v.status==='ativo')).map(i=><option value={i.id} key={i.id}>{i.name}</option>)}</select></label><label>Cargo / Função<input value={cargo} onChange={e=>setCargo(e.target.value)}/></label></div><button className="primary" disabled={busy || carregando || !!erro}>{busy?'Salvando...':'Adicionar vínculo'}</button></form></Permissao>
    {ending && <Modal title="Encerrar vínculo" onClose={()=>!busy && setEnding(null)}><p>Encerrar o vínculo com {ending.instituicao}? O histórico de participações será preservado.</p><div className="modal-actions"><button disabled={busy} onClick={()=>setEnding(null)}>Cancelar</button><button className="danger" disabled={busy} onClick={()=>save(()=>representantes.encerrarVinculo(ending.vinculoId))}>{busy?'Salvando...':'Encerrar vínculo'}</button></div></Modal>}
  </Card>;
}
