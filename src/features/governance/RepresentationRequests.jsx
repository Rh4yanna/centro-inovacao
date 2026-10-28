import { formatarData } from './datas';
import { useState } from 'react';
import { Card } from '../institutions/components';
import { Fields, Remote } from './shared';
import { useRecurso } from './useRecurso';
import { useAcao } from './useAcao';
import { ActionFeedback } from './ActionFeedback';

export default function RepresentationRequests({ onSaved }) {
  const resource = useRecurso('/minha-instituicao/representantes');
  const action = useAcao();
  const [type, setType] = useState('substituicao_representante');
  const [previous, setPrevious] = useState('');
  const [document, setDocument] = useState('');
  const [reason, setReason] = useState('');
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', cargo: '', tipo: 'titular' });
  function submit(e) {
    e.preventDefault();
    action.run('/minha-instituicao/solicitacoes', { tipo: type, representanteAnteriorId: previous, oficioId: document, justificativa: reason, ...(type === 'substituicao_representante' ? { novoRepresentante: form } : {}) }, { message: 'Solicitação enviada. O vínculo atual será preservado até a aprovação.', onSuccess: () => { setReason(''); resource.reload(); onSaved?.(); } });
  }
  return <Card title="Titular, suplente e substituições"><ActionFeedback action={action}/><Remote resource={resource}>{data => <>
    <div className="table-scroll"><table><thead><tr><th>Representante</th><th>Tipo</th><th>Início</th><th>Encerramento</th><th>Situação</th></tr></thead><tbody>{(data.dados || []).map(r => <tr key={r.vinculoId}><td>{r.nome}</td><td>{r.tipo}</td><td>{formatarData(r.inicio)}</td><td>{formatarData(r.fim)}</td><td>{r.status}</td></tr>)}</tbody></table></div>
    <form onSubmit={submit}><fieldset disabled={action.busy}><legend>Solicitar alteração da representação</legend>
      <div className="governance-fields"><label>Solicitação<select value={type} onChange={e => setType(e.target.value)}><option value="substituicao_representante">Substituir representante</option><option value="encerramento_representante">Encerrar vínculo</option></select></label>
        <label>Representante atual<select required value={previous} onChange={e => setPrevious(e.target.value)}><option value="">Selecione</option>{(data.dados || []).filter(r => r.status === 'ativo').map(r => <option key={r.vinculoId} value={r.vinculoId}>{r.nome} · {r.tipo}</option>)}</select></label></div>
      {type === 'substituicao_representante' && <Fields schema={[[ 'nome', 'Nome do novo representante', 'required'], ['email', 'E-mail do novo representante', 'email'], ['telefone', 'Telefone', 'tel'], ['cargo', 'Cargo na instituição', 'required'], ['tipo', 'Tipo de representação', 'required', ['titular', 'suplente', 'adicional']]]} value={form} onChange={setForm}/>}
      <label>Ofício enviado<select required value={document} onChange={e => setDocument(e.target.value)}><option value="">Selecione um ofício</option>{(data.oficios || []).map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}</select></label><p>Envie o ofício na seção de documentos e atualize esta seção para selecioná-lo.</p>
      <label>Motivo<textarea required maxLength={2000} value={reason} onChange={e => setReason(e.target.value)}/></label>
      <button type="button" onClick={resource.reload}>Atualizar ofícios e vínculos</button><button className="primary">Enviar solicitação de representação</button>
    </fieldset></form>
  </>}</Remote></Card>;
}
