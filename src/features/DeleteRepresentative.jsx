import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './institutions/components';
import { representantes } from '../api/recursos';
import { Permissao } from '../auth/Permissao';

export default function DeleteRepresentative({ person, onDeleted }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  async function confirm() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      await representantes.excluir(person.id);
      onDeleted(person.id);
      navigate('/representantes', { replace: true });
    } catch (e) {
      setError([404, 405, 501].includes(e.status)
        ? 'A API não disponibilizou a exclusão deste representante. O cadastro não foi removido nesta tela. Confirme a rota de exclusão com o responsável pelo backend.'
        : e.status === 403
          ? 'Sua conta não tem permissão para excluir este representante no servidor.'
          : e.status === 409
            ? 'Não foi possível excluir: existem vínculos ou registros associados. ' + e.message
            : e.message || 'Não foi possível excluir. Tente novamente.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return <Permissao excluir>
    <button className="danger-outline" onClick={() => {setError('');setOpen(true);}}>Excluir representante</button>
    {open && <Modal title="Excluir representante" onClose={() => !pending.current && setOpen(false)}>
      <p>Deseja solicitar a exclusão do cadastro de <strong>{person.name}</strong>?</p>
      <p>A exclusão pode ser definitiva. Para apenas desvincular a pessoa da instituição, utilize “Encerrar vínculo”.</p>
      {error && <p role="alert" className="error">{error}</p>}
      <div className="modal-actions">
        <button disabled={busy} onClick={() => setOpen(false)}>Cancelar</button>
        <button className="danger" disabled={busy} onClick={confirm}>{busy ? 'Excluindo...' : 'Confirmar exclusão'}</button>
      </div>
    </Modal>}
  </Permissao>;
}
