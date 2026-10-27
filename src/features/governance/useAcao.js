import { useRef, useState } from 'react';
import { governanca } from '../../api/governanca';

export function useAcao() {
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  async function run(path, corpo, { metodo = 'POST', message = 'Operação concluída.', onSuccess } = {}) {
    if (locked.current) return false;
    locked.current = true;
    setBusy(true); setError(''); setSuccess('');
    try {
      const result = await governanca(path, { metodo, corpo });
      if (result.confirmado !== true) throw new Error('O servidor não confirmou a operação. Atualize os dados antes de tentar novamente.');
      setSuccess(message);
      onSuccess?.(result);
      return true;
    } catch (e) { setError(e.message); return false; }
    finally { locked.current = false; setBusy(false); }
  }
  return { run, busy, error, success };
}
