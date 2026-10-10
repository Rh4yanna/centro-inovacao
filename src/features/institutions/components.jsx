import { exportarCsv, imprimirTabela } from '../exportacao';
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
export function Card({ title, children, className = "" }) {
  return (
    <section className={`card ${className}`}>
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}
export function Badge({ status }) {
  return (
    <span className={`badge ${["Ativa", "Ativo", "Realizada"].includes(status) ? "active" : status === "Agendada" ? "scheduled" : "inactive"}`}>
      {status}
    </span>
  );
}
export function Modal({ title, children, onClose, compact = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={compact ? "modal compact" : "modal"}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <button
        className="icon-button modal-close"
        aria-label="Fechar"
        onClick={onClose}
      >
        <X />
      </button>
      <h2>{title}</h2>
      {children}
    </dialog>
  );
}
export function Field({
  label,
  name,
  value,
  onChange,
  required = false,
  options,
  type = "text",
  placeholder,
  className = "",
  erro,
}) {
  return (
    <label className={className}>
      {label}
      {required && <span className="required"> *</span>}
      {options ? (
        <select
          name={name}
          value={value}
          required={required}
          aria-invalid={!!erro}
          onChange={onChange}
        >
          <option value="">Selecione</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          type={type}
          aria-invalid={!!erro}
          placeholder={placeholder}
        />
      )}
      {erro && <small className="field-error">{erro}</small>}
    </label>
  );
}
export function ReportModal({ institution, onClose }) {
  const rows = [['Nome',institution.name],['CNPJ',institution.cnpj],['Status',institution.status],['E-mail',institution.email],['Telefone',institution.phone],['Tipo',institution.type],['Cidade',institution.city]];
  return <Modal title="Exportar cadastro" onClose={onClose}><p>Exporta os dados cadastrais atuais. Para presenças, use a exportação na aba de participações.</p><div className="modal-actions"><button onClick={() => exportarCsv('instituicao.csv',rows)}>Exportar CSV</button><button onClick={() => imprimirTabela(institution.name,rows)}>Imprimir / PDF</button></div></Modal>;
}
