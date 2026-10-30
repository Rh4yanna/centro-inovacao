import { useState } from 'react';
import { governanca, urlSegura } from '../../api/governanca';
import { useUsuario } from '../../auth/contexto';
import { podeExcluir, representanteInstitucional, podeAnexarOficio } from '../../auth/permissoes';


function Upload({ scope, logo = false, onSaved }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  async function submit(e) {
    e.preventDefault(); setError(''); setSuccess('');
    const types = logo ? ['image/png', 'image/jpeg'] : ['application/pdf', 'image/png', 'image/jpeg'];
    if (!file || !types.includes(file.type) || file.size > 10 * 1024 * 1024) {
      setError(logo ? 'Selecione uma imagem PNG ou JPEG de até 10 MB.' : 'Selecione um PDF, PNG ou JPEG de até 10 MB.');
      return;
    }
    const body = new FormData(); body.append('arquivo', file);
    if (logo) body.append('tipo', 'logo');
    setBusy(true);
    try {
      const result = await governanca(`/${scope}/${logo ? 'documentos' : 'oficio'}`, { metodo: 'POST', formData: body });
      if (logo ? !result.documento?.id : !result.confirmado || !result.registro) throw new Error('O servidor não confirmou o recebimento do arquivo.');
      setOpen(false); setFile(null); setSuccess(logo ? 'Logo enviada. Consulte a situação atualizada.' : 'Ofício anexado ao vínculo.');
      onSaved(result.registro);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <div>
    <button type="button" disabled={busy} onClick={() => { setOpen(!open); setError(''); }}>{logo ? 'Enviar/trocar logo' : 'Anexar ofício'}</button>
    {open && <form onSubmit={submit}><label>{logo ? 'Arquivo da logo' : 'Arquivo do ofício'}<input type="file" disabled={busy} accept={logo ? 'image/png,image/jpeg' : 'application/pdf,image/png,image/jpeg'} onChange={e => setFile(e.target.files?.[0] || null)}/></label><button disabled={busy}>{busy ? 'Enviando...' : logo ? 'Enviar logo' : 'Enviar ofício'}</button></form>}
    {error && <p role="alert">{error}</p>}{success && <p role="status">{success}</p>}
  </div>;
}

export function InstitutionLogo({ registro, scope, onSaved }) {
  const user = useUsuario();
  const canUpload = podeExcluir(user) || (scope === 'minha-instituicao' && representanteInstitucional(user));
  const logo = urlSegura(registro.logoUrl);
  return <section aria-label="Logo da instituição" className="institution-logo">
    {logo ? <img src={logo} alt="Logo vigente da instituição" style={{ maxWidth: 180, maxHeight: 120, objectFit: 'contain' }}/> : <p>Nenhuma logo vigente.</p>}
    {registro.logoEmAnalise && <p role="status">Nova logo em análise</p>}
    {canUpload && <Upload scope={scope} logo onSaved={onSaved}/>}
  </section>;
}

export function RepresentativeLetter({ registro, scope, onSaved }) {
  const user = useUsuario();
  const oficio = registro.oficio;
  const url = urlSegura(oficio?.downloadUrl);
  return <section aria-label="Ofício de indicação">
    <h3>Ofício atual</h3>
    {oficio ? <p>{oficio.nome} · {oficio.status} {url && <a href={url} target="_blank" rel="noreferrer">Baixar</a>}</p> : <p>Nenhum ofício vinculado.</p>}
    {podeAnexarOficio(user) && <Upload scope={scope} onSaved={onSaved}/>}
  </section>;
}
