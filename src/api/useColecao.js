// Substitui o useLocalCollection: mesma ideia, só que os dados vêm da API.
import { useCallback, useEffect, useState } from 'react';

export function useColecao(listar) {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      setItens(await listar());
      setErro('');
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [listar]);

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const dados = await listar();
        if (vivo) {
          setItens(dados);
          setErro('');
        }
      } catch (e) {
        if (vivo) setErro(e.message);
      } finally {
        if (vivo) setCarregando(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, [listar]);

  return { itens, carregando, erro, recarregar, setItens };
}
