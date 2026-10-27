import { useState } from 'react';
import { governanca } from '../../api/governanca';
import { Card } from '../institutions/components';
import { Heading, Remote } from './shared';
import { useRecurso } from './useRecurso';
import { useAcao } from './useAcao';
import { ActionFeedback } from './ActionFeedback';
import { exportarCsv } from '../exportacao';

const templates = {
  instituicoes: ['nomeFantasia', 'razaoSocial', 'cnpj', 'email', 'telefone', 'vertente', 'gts', 'dataIngresso'],
  presencas: ['atividadeTipo', 'atividadeId', 'pessoaId', 'instituicaoId', 'statusPresenca', 'modalidade', 'horarioCheckin', 'justificativa'],
};
export default function Imports() {
  const resource = useRecurso('/importacoes');
  const action = useAcao();
  const [type, setType] = useState('instituicoes');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);
  function reset() { setPreview(null); setReceipt(null); setError(''); }
  async function validate(e) {
    e.preventDefault(); reset();
    if (!file || !/\.csv$/i.test(file.name) || file.size > 5 * 1024 * 1024) return setError('Selecione um arquivo CSV de até 5 MB.');
    const body = new FormData(); body.append('arquivo', file); body.append('tipo', type);
    setBusy(true);
    try {
      const r = await governanca('/importacoes/validar', { metodo: 'POST', formData: body });
      if (!r.previa?.id || !Array.isArray(r.previa.erros) || !Number.isInteger(r.previa.validos) || r.previa.validos < 0) throw new Error('O servidor não retornou uma validação completa.');
      setPreview(r.previa);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <><Heading title="Importação de dados">Valide uma planilha antes de incorporar instituições ou presenças ao histórico.</Heading>
    <ActionFeedback action={action}/>{error && <p role="alert">{error}</p>}
    <Remote resource={resource}>{data => <>
      <Card title="Enviar planilha"><form onSubmit={validate}><fieldset disabled={busy || action.busy}>
        <div className="governance-fields"><label>Tipo de importação<select value={type} onChange={e => { setType(e.target.value); reset(); }}><option value="instituicoes">Instituições</option><option value="presencas">Presenças</option></select></label>
          <label>Arquivo CSV (UTF-8, separado por ponto e vírgula)<input required type="file" accept=".csv,text/csv" onChange={e => { setFile(e.target.files?.[0] || null); reset(); }}/></label></div>
        <button type="button" onClick={() => exportarCsv(`modelo-${type}.csv`, [templates[type]])}>Baixar modelo CSV</button><button className="primary">{busy ? 'Validando...' : 'Validar arquivo'}</button>
      </fieldset></form></Card>
      {preview && <Card title="Revisar importação"><p>{preview.validos} registros válidos · {preview.erros.length} erros · {preview.duplicados ?? 0} duplicados.</p>
        <p>A validação não altera o cadastro. Corrija os erros e duplicidades antes de confirmar.</p>
        {preview.erros.map((e, index) => <p key={index} className="error">Linha {e.linha}: {e.mensagem}</p>)}
        <div className="table-scroll"><table><thead><tr>{(preview.colunas || []).map(c => <th key={c}>{c}</th>)}</tr></thead><tbody>{(preview.amostra || []).map((row, index) => <tr key={index}>{(preview.colunas || []).map(c => <td key={c}>{String(row[c] ?? '')}</td>)}</tr>)}</tbody></table></div>
        <button className="primary" disabled={busy || action.busy || !preview.validos || preview.erros.length > 0 || preview.duplicados > 0} onClick={() => action.run('/importacoes/confirmar', { previaId: preview.id }, { message: 'Importação confirmada pelo servidor.', onSuccess: r => { setReceipt(r.importacao); setPreview(null); resource.reload(); } })}>{action.busy ? 'Importando...' : `Confirmar importação de ${preview.validos} registros`}</button>
      </Card>}
      {receipt && <Card title="Resultado"><p>Importação {receipt.id}: {receipt.status}. {receipt.importados ?? '—'} registros importados.</p></Card>}
      <Card title="Histórico de importações">{(data.dados || []).map(i => <p key={i.id}>{i.criadaEm} · {i.tipo} · {i.status} · {i.importados ?? 0} registros · {i.autorNome}</p>)}{!data.dados?.length && <p>Nenhuma importação registrada.</p>}</Card>
    </>}</Remote></>;
}
