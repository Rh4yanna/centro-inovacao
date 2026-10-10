import { useEffect, useState } from 'react';
import { governanca } from '../../api/governanca';

export function useRecurso(path) {
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    governanca(path).then(data => {
      if (active) setState({ path, loading: false, data, error: '' });
    }).catch(error => {
      if (active) setState({ path, loading: false, data: null, error: [404, 405, 501].includes(error.status) ? 'Este serviço ainda não está disponível. Tente novamente mais tarde.' : error.message });
    });
    return () => { active = false; };
  }, [path, version]);
  return { ...state, loading: state.loading || state.path !== path, reload: () => { setState({ loading: true, data: null, error: '' }); setVersion(v => v + 1); } };
}
