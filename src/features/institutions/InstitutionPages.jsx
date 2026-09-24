import { useEffect, useState } from "react";
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
import { states, emptyInstitution } from "./data";
import { useDominios } from "../../api/dominios-contexto";
import { instituicoes } from "../../api/recursos";
export function InstitutionList({ institutions }) {
  const dominios = useDominios();
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
            ["Status", status, setStatus, dominios.statusInstituicao],
            ["Tipo", type, setType, dominios.tipos],
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
export function InstitutionForm({ onSave }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const dominios = useDominios();
  const [form, setForm] = useState({ ...emptyInstitution });
  const [error, setError] = useState("");
  const [porCampo, setPorCampo] = useState({});
  const [carregando, setCarregando] = useState(!!id);
  const [enviando, setEnviando] = useState(false);

  // A listagem traz um resumo; para editar é preciso o registro inteiro.
  useEffect(() => {
    if (!id) return;
    let vivo = true;
    instituicoes
      .obter(id)
      .then((i) => vivo && setForm({ ...emptyInstitution, ...i }))
      .catch((e) => vivo && setError(e.message))
      .finally(() => vivo && setCarregando(false));
    return () => {
      vivo = false;
    };
  }, [id]);

  if (carregando) return <p className="empty">Carregando instituição...</p>;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const field = (name, label, options = {}) => (
    <Field
      key={name}
      name={name}
      label={label}
      value={form[name]}
      onChange={change}
      erro={porCampo[MAPA_ERRO[name]]}
      {...options}
    />
  );

  async function submit(e) {
    e.preventDefault();
    setError("");
    setPorCampo({});
    if (form.cnpj.replace(/\D/g, "").length !== 14) {
      setError("Informe um CNPJ com 14 dígitos.");
      return;
    }
    if (!form.name.trim()) {
      setError("Informe o nome da instituição.");
      return;
    }
    setEnviando(true);
    // A validação de verdade é a do servidor; ele devolve erro por campo.
    const r = await onSave({ ...form, name: form.name.trim(), id });
    if (r === true) return navigate("/instituicoes");
    setEnviando(false);
    if (r?.porCampo) setPorCampo(r.porCampo());
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
              options: dominios.statusInstituicao,
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
              placeholder: "https://instituicao.com.br",
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
              options: dominios.tipos,
              className: "span-3",
            })}
            {field("area", "Área de atuação", {
              required: true,
              options: dominios.areas,
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
          <button className="primary" disabled={enviando}>
            {enviando
              ? "Salvando..."
              : id
                ? "Salvar alterações"
                : "Cadastrar instituição"}
          </button>
        </div>
      </form>
    </>
  );
}
// Liga o nome do input ao nome que a API usa no erro.
const MAPA_ERRO = {
  name: "nome",
  cnpj: "cnpj",
  founded: "dataFundacao",
  status: "status",
  email: "email",
  phone: "telefone",
  site: "site",
  street: "logradouro",
  number: "numero",
  neighborhood: "bairro",
  city: "cidade",
  state: "estado",
  zip: "cep",
  complement: "complemento",
  type: "tipoInstituicaoId",
  area: "areaAtuacaoId",
  description: "descricao",
};
function Info({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value || "Não informado"}</dd>
    </div>
  );
}
export function InstitutionDetail({ onTrocarStatus, onDelete }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [institution, setInstitution] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [falha, setFalha] = useState("");
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState(null);
  const [tab, setTab] = useState("overview");

  // Mudar esta chave refaz a busca (depois de ativar/desativar, por exemplo).
  const [chave, setChave] = useState(0);
  const buscar = () => setChave((n) => n + 1);

  useEffect(() => {
    let vivo = true;
    instituicoes
      .obter(id)
      .then((d) => vivo && setInstitution(d))
      .catch((e) => vivo && setFalha(e.message))
      .finally(() => vivo && setCarregando(false));
    return () => {
      vivo = false;
    };
  }, [id, chave]);

  if (carregando) return <p className="empty">Carregando instituição...</p>;
  if (falha || !institution)
    return (
      <p>
        {falha || "Instituição não encontrada."}{" "}
        <Link to="/instituicoes">Voltar</Link>
      </p>
    );
  const i = institution;
  const linked = i.representantes || [];
  const p = i.participacao || {};
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
            onClick={async () => {
              const alvo = i.status === "Ativa" ? "Inativa" : "Ativa";
              if (await onTrocarStatus(id, alvo)) buscar();
            }}
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
        {[['representatives','Representantes'],['participations','Participações'],['meetings','Reuniões'],['documents','Documentos']].map(([key,label]) => <button key={key} className={tab === key ? 'selected' : ''} onClick={() => setTab(key)}>{label}</button>)}
      </div>
      {tab === "overview" ? (
        <div className="detail-grid">
          <div>
            <Card title="Informações básicas">
              <dl className="info-grid">
                <Info label="Nome da instituição" value={i.name} />
                <Info label="Telefone" value={i.phone} />
                <Info label="CNPJ" value={i.cnpj} />
                <Info label="Data de fundação" value={date(i.founded)} />
                <Info label="E-mail institucional" value={i.email} />
                <Info label="Número de representantes" value={String(i.totalRepresentantes ?? linked.length)} />
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
                Nenhum registro disponível.
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
                  ["Participações totais", p.participacoesTotais],
                  ["Reuniões participadas", p.reunioesParticipadas],
                  [
                    "Média de presença",
                    p.mediaPresenca == null ? null : `${p.mediaPresenca}%`,
                  ],
                  ["Última participação", p.ultimaParticipacao && date(p.ultimaParticipacao)],
                ].map(([label, valor]) => (
                  <div key={label}>
                    <small>{label}</small>
                    <strong>{valor ?? "—"}</strong>
                    <small>
                      {valor == null ? "Nenhum registro disponível." : ""}
                    </small>
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
        <Card title={{representatives:'Representantes',participations:'Participações',meetings:'Reuniões',documents:'Documentos'}[tab]}>
          {tab === 'representatives' ? <>
            <Link className="button primary" to="/representantes/novo">+ Adicionar representante</Link>
            <div className="table-scroll"><table><thead><tr><th>Nome</th><th>Cargo / Função</th><th>E-mail</th><th>Status</th><th>Ações</th></tr></thead><tbody>{linked.map(r => <tr key={r.id}><td>{r.name}</td><td>{r.role}</td><td>{r.email}</td><td><Badge status={r.status}/></td><td><Link className="button" to={`/representantes/${r.id}`}>Ver representante</Link></td></tr>)}</tbody></table></div>
            {!linked.length && <p className="empty">Nenhum representante vinculado.</p>}
          </> : <p className="empty">{{participations:'Nenhuma participação registrada para esta instituição.',meetings:'Nenhuma reunião vinculada a esta instituição.',documents:'Nenhum documento cadastrado para esta instituição.'}[tab]}</p>}
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
              onClick={async () => {
                if ((await onDelete(id)) === true) navigate("/instituicoes");
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
