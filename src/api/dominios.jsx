// As listas dos selects vêm do banco, não de constantes no código.
// Assim quando alguém cadastra um tipo novo a tela acompanha sozinha.
import { useEffect, useState } from 'react';
import { get } from './cliente';
import { ContextoDominios } from './dominios-contexto';

const VAZIO = {
  tiposInstituicao: [],
  areasAtuacao: [],
  statusInstituicao: [],
};

export function DominiosProvider({ children }) {
  const [dados, setDados] = useState(VAZIO);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let vivo = true;
    get('/api/dominios')
      .then((d) => vivo && setDados({ ...VAZIO, ...d }))
      .catch(() => {})
      .finally(() => vivo && setCarregando(false));
    return () => {
      vivo = false;
    };
  }, []);

  const tipos = dados.tiposInstituicao.filter((t) => t.ativo);
  const areas = dados.areasAtuacao.filter((a) => a.ativo);

  const valor = {
    carregando,
    tipos: tipos.map((t) => t.nome),
    areas: areas.map((a) => a.nome),
    statusInstituicao: dados.statusInstituicao.map((s) => s.rotulo),
    idDoTipo: (nome) => tipos.find((t) => t.nome === nome)?.id,
    idDaArea: (nome) => areas.find((a) => a.nome === nome)?.id,
  };

  return (
    <ContextoDominios.Provider value={valor}>{children}</ContextoDominios.Provider>
  );
}
