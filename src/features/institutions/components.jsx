import { useEffect, useRef, useState } from "react";
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
    <span className={`badge ${status === "Ativa" ? "active" : "inactive"}`}>
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
          placeholder={placeholder}
        />
      )}
    </label>
  );
}
export function ReportModal({ institution, onClose }) {
  const [kind, setKind] = useState("Relatório completo");
  const [format, setFormat] = useState("PDF");
  const [start, setStart] = useState("2026-01-01");
  const [end, setEnd] = useState("2026-09-01");
  function generate(e) {
    e.preventDefault();
    const rows = [
      ["Relatório", kind],
      ["Período", `${start} a ${end}`],
      ["Instituição", institution.name],
      ["Status", institution.status],
      ...(kind === "Relatório completo"
        ? Object.entries(institution).filter(
            ([key]) => !["id", "name", "status"].includes(key),
          )
        : []),
      [
        "Observação",
        "aguardando back",
      ],
    ];
    if (format === "CSV") {
      const csv =
        "\ufeff" +
        rows
          .map((row) =>
            row
              .map(
                (v) =>
                  '"' +
                  String(v)
                    .replace(/^[=+@-]/, "'$&")
                    .replaceAll('"', '""') +
                  '"',
              )
              .join(";"),
          )
          .join("\r\n");
      const url = URL.createObjectURL(
        new Blob([csv], { type: "text/csv;charset=utf-8" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio-instituicao.csv";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      const frame = document.createElement("iframe");
      frame.style.cssText = "position:fixed;width:0;height:0;border:0";
      document.body.append(frame);
      const doc = frame.contentDocument;
      const heading = doc.createElement("h1");
      heading.textContent = institution.name;
      doc.body.append(heading);
      for (const [key, value] of rows) {
        const p = doc.createElement("p");
        p.textContent = `${key}: ${value || "Não informado"}`;
        doc.body.append(p);
      }
      frame.contentWindow.focus();
      frame.contentWindow.print();
      setTimeout(() => frame.remove(), 60000);
    }
  }
  return (
    <Modal title="Gerar relatório" onClose={onClose}>
      <p>
        Selecione as informações que deseja incluir no relatório da instituição.
      </p>
      <form onSubmit={generate}>
        <fieldset>
          <legend>Tipo de relatório</legend>
          {["Relatório completo", "Reuniões e presença", "Representantes"].map(
            (v, i) => (
              <label className="radio" key={v}>
                <input
                  type="radio"
                  name="kind"
                  checked={kind === v}
                  onChange={() => setKind(v)}
                />
                <span>
                  {v}
                  <small>
                    {
                      [
                        "Todas as informações da instituição.",
                        "Histórico de encontros e taxa de frequência.",
                        "Pessoas vinculadas e cargos.",
                      ][i]
                    }
                  </small>
                </span>
              </label>
            ),
          )}
        </fieldset>
        <div className="two-columns">
          <Field
            label="Data inicial"
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
          <label>
            Data final
            <input
              type="date"
              required
              min={start}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
        </div>
        <fieldset>
          <legend>Formato do relatório</legend>
          {["PDF", "CSV"].map((v) => (
            <label className="radio" key={v}>
              <input
                type="radio"
                name="format"
                checked={format === v}
                onChange={() => setFormat(v)}
              />
              <span>
                {v === "CSV"
                  ? "Planilha (CSV, compatível com Excel)"
                  : "PDF (salvar pela impressão)"}
              </span>
            </label>
          ))}
        </fieldset>
        <p className="muted">
          aguardando back
        </p>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">Gerar relatório</button>
        </div>
      </form>
    </Modal>
  );
}
