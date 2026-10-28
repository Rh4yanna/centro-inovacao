import { formatarData } from './datas';
import { Card } from '../institutions/components';

export function Remote({ resource, children }) {
  if (resource.loading) return <p role="status" className="empty">Carregando...</p>;
  if (resource.error) return <Card><p role="alert">{resource.error}</p><button onClick={resource.reload}>Tentar novamente</button></Card>;
  return children(resource.data);
}

export function Heading({ title, children }) {
  return <header className="page-heading"><h1>{title}</h1><p>{children}</p></header>;
}

// Esquemas pequenos compartilhados pelos formulários e pelo contrato do backend.
export function Fields({ schema, value, onChange, disabled = false }) {
  return <div className="governance-fields">{schema.map(([name, label, type = 'text', options]) => <label key={name}>
    {label}{type === 'checkbox' ? <input type="checkbox" disabled={disabled} checked={!!value[name]} onChange={e => onChange({ ...value, [name]: e.target.checked })}/>
      : options ? <select disabled={disabled} value={value[name] ?? ''} required={type === 'required'} onChange={e => onChange({ ...value, [name]: e.target.value })}><option value="">Selecione</option>{options.map(o => <option key={o} value={o}>{o.replaceAll('_', ' ')}</option>)}</select>
        : type === 'textarea' ? <textarea disabled={disabled} maxLength={5000} value={value[name] ?? ''} onChange={e => onChange({ ...value, [name]: e.target.value })}/>
          : <input disabled={disabled} required={type === 'required'} type={type === 'required' ? 'text' : type} min={type === 'number' ? 0 : undefined} value={value[name] ?? ''} onChange={e => onChange({ ...value, [name]: type === 'number' && e.target.value !== '' ? Number(e.target.value) : e.target.value })}/>}</label>)}</div>;
}

export function Details({ schema, value }) {
  return <dl className="info-grid">{schema.map(([key, label, type]) => <div key={key}><dt>{label}</dt><dd>{type === 'checkbox' ? (value[key] ? 'Sim' : 'Não') : ['date', 'datetime-local'].includes(type) ? formatarData(value[key], type === 'datetime-local') : String(value[key] ?? '') || 'Não informado'}</dd></div>)}</dl>;
}
