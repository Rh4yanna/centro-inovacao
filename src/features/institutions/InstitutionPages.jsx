import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Eye,
  MoreVertical,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Card, Badge, Field, Modal, ReportModal } from "./components";
import { types, states, emptyInstitution } from "./data";
export function InstitutionList({ institutions }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);
  const [menu, setMenu] = useState(null);
  const filtered = institutions.filter(
    (i) =>
      (!query ||
        `${i.name} ${i.cnpj}`
          .toLocaleLowerCase("pt-BR")
          .includes(query.toLocaleLowerCase("pt-BR")) ||
        i.cnpj
          .replace(/\D/g, "")
          .includes(query.replace(/\D/g, "") || "no-match")) &&
      (!status || i.status === status) &&
      (!type || i.type === type) &&
      (!city || i.city === city),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 9));
  const current = Math.min(page, pages);
  return (
    <>
      <header className="page-heading">
        <h1>Instituições</h1>
        <p>Gerencie as instituições que fazem parte do ecossistema.</p>
      </header>
      <Card title="Busca e filtros">
        <div className="filters">
          <label>
            Buscar por nome ou CNPJ
            <div className="input-icon">
              <Search />
              <input
                placeholder="Digite o nome ou CNPJ"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </label>
          {[
            ["Status", status, setStatus, ["Ativa", "Inativa"]],
            ["Tipo", type, setType, types],
            [
              "Cidade",
              city,
              setCity,
              [...new Set(institutions.map((i) => i.city))],
            ],
          ].map(([label, value, setter, options]) => (
            <label key={label}>
              {label}
              <select
                value={value}
                onChange={(e) => {
                  setter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">
                  {label === "Cidade" ? "Todas" : "Todos"}
                </option>
                {options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          ))}
          <button
            className="neutral"
            onClick={() => {
              setQuery("");
              setStatus("");
              setType("");
              setCity("");
              setPage(1);
            }}
          >
            <Filter />
            Limpar filtros
          </button>
        </div>
      </Card>
      <Card>
        <div className="section-heading">
          <h2>Instituições cadastradas</h2>
          <Link className="button primary" to="/instituicoes/nova">
            + Nova instituição
          </Link>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {[
                  "Instituição",
                  "CNPJ",
                  "Tipo",
                  "Cidade",
                  "Status",
                  "Ações",
                ].map((v) => (
                  <th key={v}>{v}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice((current - 1) * 9, current * 9).map((i) => (
                <tr key={i.id}>
                  <td>
                    <strong>{i.name}</strong>
                    <small>{i.email || "E-mail não informado"}</small>
                  </td>
                  <td>{i.cnpj}</td>
                  <td>
                    <span className="badge type">{i.type}</span>
                  </td>
                  <td>
                    {i.city}, {i.state}
                  </td>
                  <td>
                    <Badge status={i.status} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <Link
                        className="icon-button"
                        aria-label={`Ver ${i.name}`}
                        to={`/instituicoes/${i.id}`}
                      >
                        <Eye />
                      </Link>
                      <div className="menu-wrap">
                        <button
                          className="icon-button"
                          aria-label={`Ações de ${i.name}`}
                          aria-expanded={menu === i.id}
                          onClick={() => setMenu(menu === i.id ? null : i.id)}
                        >
                          <MoreVertical />
                        </button>
                        {menu === i.id && (
                          <div className="dropdown">
                            <Link to={`/instituicoes/${i.id}/editar`}>
                              Editar instituição
                            </Link>
                            <Link to={`/instituicoes/${i.id}`}>
                              Ver detalhes
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <p className="empty">Nenhuma instituição encontrada.</p>
          )}
        </div>
        <footer className="pagination">
          <small>
            Mostrando {filtered.length ? (current - 1) * 9 + 1 : 0} a{" "}
            {Math.min(current * 9, filtered.length)} de {filtered.length}{" "}
            instituições
          </small>
          <div>
            <button
              aria-label="Página anterior"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft />
            </button>
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                className={current === i + 1 ? "primary" : ""}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              aria-label="Próxima página"
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
            >
              <ChevronRight />
            </button>
          </div>
        </footer>
      </Card>
    </>
  );
}
export function InstitutionForm({ institutions, onSave }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const existing = institutions.find((i) => i.id === id);
  const [form, setForm] = useState(() => existing || { ...emptyInstitution });
  const [error, setError] = useState("");
  if (id && !existing)
    return (
      <p>
        Instituição não encontrada. <Link to="/instituicoes">Voltar</Link>
      </p>
    );
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const field = (name, label, options = {}) => (
    <Field
      key={name}
      name={name}
      label={label}
      value={form[name]}
      onChange={change}
      {...options}
    />
  );
  function submit(e) {
    e.preventDefault();
    if (form.cnpj.replace(/\D/g, "").length !== 14) {
      setError("Informe um CNPJ com 14 dígitos.");
      return;
    }
    if (
      institutions.some(
        (i) =>
          i.id !== id &&
          i.cnpj.replace(/\D/g, "") === form.cnpj.replace(/\D/g, ""),
      )
    ) {
      setError("Já existe uma instituição com este CNPJ.");
      return;
    }
    const saved = {
      ...form,
      name: form.name.trim(),
      id: id || crypto.randomUUID(),
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!saved.name) {
      setError("Informe o nome da instituição.");
      return;
    }
    if (onSave(saved)) navigate(`/instituicoes/${saved.id}`);
  }
  return (
    <>
      <header className="page-heading">
        <h1>{id ? "Editar" : "Nova"} instituição</h1>
        <p>
          {id
            ? "Edite as informações da instituição cadastrada."
            : "Preencha as informações para cadastrar uma nova instituição no ecossistema."}
        </p>
      </header>
      <form onSubmit={submit}>
        <Card title="Informações básicas">
          <div className="form-grid">
            {field("name", "Nome da instituição", {
              required: true,
              className: "span-4",
              placeholder: "Digite o nome da instituição",
            })}
            {field("cnpj", "CNPJ", {
              required: true,
              className: "span-2",
              placeholder: "00.000.000/0000-00",
            })}
            {field("founded", "Data de fundação", {
              required: true,
              type: "date",
              className: "span-2",
            })}
            {field("status", "Status", {
              required: true,
              options: ["Ativa", "Inativa"],
              className: "span-2",
            })}
            {field("email", "E-mail institucional", {
              type: "email",
              className: "span-3",
              placeholder: "exemplo@instituicao.com.br",
            })}
            {field("phone", "Telefone", {
              required: true,
              type: "tel",
              className: "span-2",
              placeholder: "(00) 00000-0000",
            })}
            {field("site", "Site", {
              className: "span-3",
              placeholder: "Instituicao.com.br",
            })}
          </div>
        </Card>
        <Card title="Endereço">
          <div className="form-grid">
            {field("street", "Logradouro", {
              required: true,
              className: "span-4",
              placeholder: "Digite o logradouro",
            })}
            {field("number", "Número", {
              className: "span-2",
              placeholder: "Digite o número",
            })}
            {field("neighborhood", "Bairro", {
              required: true,
              className: "span-2",
              placeholder: "Digite o bairro",
            })}
            {field("city", "Cidade", {
              required: true,
              className: "span-2",
              placeholder: "Digite a cidade",
            })}
            {field("state", "Estado", {
              required: true,
              options: states,
              className: "span-2",
            })}
            {field("zip", "CEP", {
              required: true,
              className: "span-2",
              placeholder: "00000-000",
            })}
            {field("complement", "Complemento", {
              className: "span-4",
              placeholder: "Sala, bloco, andar, etc.",
            })}
          </div>
        </Card>
        <Card title="Classificação">
          <div className="form-grid">
            {field("type", "Tipo de instituição", {
              required: true,
              options: types,
              className: "span-3",
            })}
            {field("area", "Área de atuação", {
              required: true,
              options: [
                "Educação",
                "Tecnologia",
                "Pesquisa",
                "Saúde",
                "Indústria",
                "Comércio",
                "Serviços",
                "Agronegócio",
                "Outra",
              ],
              className: "span-3",
            })}
            <label className="span-10">
              Descrição
              <textarea
                name="description"
                maxLength={500}
                value={form.description}
                onChange={change}
                placeholder="Descreva brevemente a instituição e suas principais atividades."
              />
              <small className="character-count">
                {form.description.length}/500
              </small>
            </label>
          </div>
        </Card>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button
            type="button"
            onClick={() =>
              navigate(id ? `/instituicoes/${id}` : "/instituicoes")
            }
          >
            Cancelar
          </button>
          <button className="primary">
            {id ? "Salvar alterações" : "Cadastrar instituição"}
          </button>
        </div>
      </form>
    </>
  );
}
function Info({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value || "Não informado"}</dd>
    </div>
  );
}
export function InstitutionDetail({ institutions, onSave, onDelete }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const institution = institutions.find((i) => i.id === id);
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState(null);
  const [tab, setTab] = useState("overview");
  if (!institution)
    return (
      <p>
        Instituição não encontrada. <Link to="/instituicoes">Voltar</Link>
      </p>
    );
  const i = institution;
  const date = (v) =>
    v
      ? new Date(v.includes("T") ? v : v + "T12:00:00").toLocaleDateString(
          "pt-BR",
        )
      : "Não informado";
  return (
    <>
      <header className="page-heading detail-heading">
        <div>
          <div className="title-line">
            <h1>{i.name}</h1>
            <Badge status={i.status} />
          </div>
          <p className="muted">{i.type}</p>
        </div>
        <div className="row-actions">
          <Link className="button" to={`/instituicoes/${id}/editar`}>
            Editar instituição
          </Link>
          <button
            className={
              i.status === "Ativa" ? "danger-outline" : "success-outline"
            }
            onClick={() =>
              onSave({
                ...i,
                status: i.status === "Ativa" ? "Inativa" : "Ativa",
                updatedAt: new Date().toISOString(),
              })
            }
          >
            {i.status === "Ativa" ? "Desativar" : "Ativar"} instituição
          </button>
          <div className="menu-wrap">
            <button
              className="icon-button bordered"
              aria-label="Mais ações"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              <MoreVertical />
            </button>
            {menu && (
              <div className="dropdown">
                <button
                  onClick={() => {
                    setModal("report");
                    setMenu(false);
                  }}
                >
                  Gerar relatório
                </button>
                <button
                  className="danger-text"
                  onClick={() => {
                    setModal("delete");
                    setMenu(false);
                  }}
                >
                  Excluir instituição
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="tabs">
        <button
          className={tab === "overview" ? "selected" : ""}
          onClick={() => setTab("overview")}
        >
          Visão geral
        </button>
        {i.status === "Ativa" && (
          <button
            className={tab === "representatives" ? "selected" : ""}
            onClick={() => setTab("representatives")}
          >
            Representantes
          </button>
        )}
      </div>
      {tab === "overview" || i.status === "Inativa" ? (
        <div className="detail-grid">
          <div>
            <Card title="Informações básicas">
              <dl className="info-grid">
                <Info label="Nome da instituição" value={i.name} />
                <Info label="Telefone" value={i.phone} />
                <Info label="CNPJ" value={i.cnpj} />
                <Info label="Data de fundação" value={date(i.founded)} />
                <Info label="E-mail institucional" value={i.email} />
                <Info label="Número de representantes" value="aguardando back" />
                <Info label="Site" value={i.site} />
              </dl>
            </Card>
            <Card title="Classificação">
              <dl className="info-grid">
                <Info label="Tipo instituição" value={i.type} />
                <Info label="Área de atuação principal" value={i.area} />
                <div className="wide">
                  <Info label="Descrição" value={i.description} />
                </div>
              </dl>
            </Card>
            <Card title="Documentos">
              <p className="muted">
                aguardando back
              </p>
            </Card>
          </div>
          <div>
            <Card title="Endereço">
              <dl className="info-grid">
                <Info
                  label="Logradouro"
                  value={[i.street, i.number].filter(Boolean).join(", ")}
                />
                <Info label="Complemento" value={i.complement} />
                <Info label="Bairro" value={i.neighborhood} />
                <Info label="CEP" value={i.zip} />
                <Info label="Cidade" value={i.city} />
                <Info label="Estado" value={i.state} />
              </dl>
            </Card>
            <Card title="Resumo de participação">
              <div className="summary-grid">
                {[
                  "Participações totais",
                  "Reuniões participadas",
                  "Média de presença",
                  "Última participação",
                ].map((label) => (
                  <div key={label}>
                    <small>{label}</small>
                    <strong>—</strong>
                    <small>aguardando back</small>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Informações do cadastro">
              <dl className="info-grid">
                <Info label="Cadastrada em" value={date(i.createdAt)} />
                <Info label="Cadastrada por" value={i.createdBy} />
                <Info label="Última atualização" value={date(i.updatedAt)} />
                <Info label="Atualizada por" value={i.updatedBy} />
              </dl>
            </Card>
          </div>
        </div>
      ) : (
        <Card title="Representantes">
          <p className="empty">
            aguardando back
          </p>
        </Card>
      )}
      <Link className="button" to="/instituicoes">
        Voltar
      </Link>
      {modal === "report" && (
        <ReportModal institution={i} onClose={() => setModal(null)} />
      )}{" "}
      {modal === "delete" && (
        <Modal
          compact
          title="Excluir instituição"
          onClose={() => setModal(null)}
        >
          <AlertCircle className="alert-icon" />
          <p>
            Tem certeza que deseja excluir a instituição{" "}
            <strong>{i.name}</strong>?
          </p>
          <p className="warning">
            Ao excluir, todas as informações deste cadastro serão removidas do
            navegador. Esta ação não poderá ser desfeita.
          </p>
          <div className="modal-actions">
            <button onClick={() => setModal(null)}>Cancelar</button>
            <button
              className="danger"
              onClick={() => {
                if (onDelete(id)) navigate("/instituicoes");
              }}
            >
              Excluir instituição
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
