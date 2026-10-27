import { useState } from 'react';
import { useUsuario } from '../../auth/contexto';
import { Card, Modal } from '../institutions/components';
import { Fields, Heading, Remote } from './shared';
import { useRecurso } from './useRecurso';
import { useAcao } from './useAcao';
import { ActionFeedback } from './ActionFeedback';

const roles = ['admin_geral', 'diretoria', 'representante_instituicao'];
const empty = { nome: '', email: '', papel: 'representante_instituicao', instituicaoId: '', ativo: true };

export default function Accounts() {
  const resource = useRecurso('/contas');
  const user = useUsuario();
  const action = useAcao();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [confirmation, setConfirmation] = useState(false);
  const [validation, setValidation] = useState('');

  function review(e) {
    e.preventDefault(); setValidation('');
    if (!editing.nome.trim() || !editing.email.trim()) return setValidation('Informe nome e e-mail.');
    if (editing.papel === 'representante_instituicao' && !editing.instituicaoId) return setValidation('Selecione a instituição da conta.');
    const ownRole = ['administrador', 'admin'].includes(user.papel) ? 'admin_geral' : user.papel;
    if (editing.id === user.id && (!editing.ativo || editing.papel !== ownRole)) return setValidation('Peça a outro administrador para alterar seu acesso.');
    setConfirmation(true);
  }
  function save() {
    const { id, nome, email, papel, instituicaoId, ativo, versaoRegistro } = editing;
    action.run(id ? `/contas/${encodeURIComponent(id)}` : '/contas', {
      nome: nome.trim(), email: email.trim(), papel, ativo,
      instituicaoId: papel === 'representante_instituicao' ? instituicaoId : null,
      versaoRegistro,
    }, { metodo: id ? 'PATCH' : 'POST', message: id ? 'Conta atualizada.' : 'Conta criada. O servidor registrou o convite de acesso.', onSuccess: () => { setEditing(null); setConfirmation(false); resource.reload(); } });
  }
  return <><Heading title="Contas e permissões">Gerencie acessos individuais e seus vínculos institucionais.</Heading>
    <ActionFeedback action={action}/>
    <Remote resource={resource}>{data => <Card>
      <div className="section-heading"><h2>Contas cadastradas</h2><button className="primary" onClick={() => { setEditing({ ...empty }); setValidation(''); }}>Nova conta</button></div>
      <label>Buscar nome ou e-mail<input value={query} onChange={e => setQuery(e.target.value)}/></label>
      <div className="table-scroll"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Instituição</th><th>Situação</th><th>Ações</th></tr></thead><tbody>
        {(data.dados || []).filter(c => `${c.nome} ${c.email}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))).map(c => <tr key={c.id}><td>{c.nome}</td><td>{c.email}</td><td>{c.papel}</td><td>{c.instituicaoNome || '—'}</td><td>{c.ativo ? 'Ativa' : 'Inativa'}</td><td><button onClick={() => { setEditing({ ...empty, ...c }); setValidation(''); }}>Editar {c.nome}</button></td></tr>)}
      </tbody></table></div>
      {!data.dados?.length && <p>Nenhuma conta cadastrada.</p>}
      {editing && <Modal title={editing.id ? 'Editar conta' : 'Nova conta'} onClose={() => { if (!action.busy) { setEditing(null); setConfirmation(false); } }}>
        <form onSubmit={review}><Fields schema={[[ 'nome', 'Nome', 'required'], ['email', 'E-mail', 'email'], ['papel', 'Perfil', 'required', roles], ['ativo', 'Conta ativa', 'checkbox']]} value={editing} onChange={setEditing} disabled={action.busy || confirmation}/>
          {editing.papel === 'representante_instituicao' && <label>Instituição<select required disabled={action.busy || confirmation} value={editing.instituicaoId} onChange={e => setEditing({ ...editing, instituicaoId: e.target.value })}><option value="">Selecione</option>{(data.instituicoes || []).map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}</select></label>}
          {validation && <p role="alert">{validation}</p>}
          {!confirmation && <button className="primary">Revisar acesso</button>}
        </form>
        {confirmation && <div><p>Confirmar o perfil <strong>{editing.papel}</strong> para <strong>{editing.email}</strong>, com a conta {editing.ativo ? 'ativa' : 'inativa'}?</p><ActionFeedback action={action}/><button disabled={action.busy} onClick={() => setConfirmation(false)}>Voltar à edição</button><button className="primary" disabled={action.busy} onClick={save}>{action.busy ? 'Salvando...' : 'Confirmar acesso'}</button></div>}
      </Modal>}
    </Card>}</Remote>
  </>;
}
