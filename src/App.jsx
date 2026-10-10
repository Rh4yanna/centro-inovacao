import { Attendance } from "./features/Attendance";
import { useCallback, useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  House,
  Building2,
  Users,
  CalendarDays,
  QrCode,
  CircleUserRound,
  Bell,
  LogOut,
} from "lucide-react";
import LoginPage from "./features/auth/pages/LoginPage";
import EsqueciSenhaPage from "./features/auth/pages/EsqueciSenhaPage";
import Dashboard from "./features/Dashboard";
import {
  InstitutionList,
  InstitutionForm,
  InstitutionDetail,
} from "./features/institutions/InstitutionPages";
import { Card, Modal } from "./features/institutions/components";
import {
  Representatives,
  RepresentativeForm,
  RepresentativeDetail,
  Meetings,
  MeetingForm,
  MeetingDetail,
} from "./features/ManagementPages";
import { DominiosProvider } from "./api/dominios";
import { useDominios } from "./api/dominios-contexto";
import { useColecao } from "./api/useColecao";
import { quandoPerderSessao } from "./api/cliente";
import { instituicoes, representantes, reunioes, sessao } from "./api/recursos";
import { UsuarioContext } from "./auth/contexto";
import { podeAbrir, menuDoUsuario, representanteInstitucional } from "./auth/permissoes";
import PublicDashboard from "./features/governance/PublicDashboard";
import { Events, EventPage } from "./features/governance/Events";
import { InstitutionArea, Approvals } from "./features/governance/InstitutionArea";
import { Checkin } from "./features/governance/Participation";
import "./App.css";

const ICONES = {
  "/dashboard": House,
  "/instituicoes": Building2,
  "/representantes": Users,
  "/reunioes": CalendarDays,
  "/presencas": QrCode,
  "/eventos": CalendarDays,
  "/solicitacoes": Bell,
  "/minha-instituicao": Building2,
};

function Workspace({ user, onLogout }) {
  const dominios = useDominios();
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState(false);
  const location = useLocation();

  const listarInstituicoes = useCallback(() => podeAbrir(user, "/instituicoes") ? instituicoes.listar() : Promise.resolve([]), [user]);
  const listarRepresentantes = useCallback(() => podeAbrir(user, "/representantes") ? representantes.listar() : Promise.resolve([]), [user]);
  const listarReunioes = useCallback(() => podeAbrir(user, "/reunioes") ? reunioes.listar() : Promise.resolve([]), [user]);

  const inst = useColecao(listarInstituicoes);
  const reps = useColecao(listarRepresentantes);
  const meets = useColecao(listarReunioes);

  // Toda gravação recarrega a lista: quem manda no dado é o banco.
  // Devolve true, ou o erro — o formulário usa ele para marcar os campos.
  const gravar = async (acao, recarregar, sucesso) => {
    try {
      await acao();
      await recarregar();
      setMessage(sucesso);
      return true;
    } catch (e) {
      setMessage(e.message);
      return e;
    }
  };

  async function salvarInstituicao(form) {
    const existente = inst.itens.some((i) => i.id === form.id);
    return gravar(
      () =>
        existente
          ? instituicoes.editar(form.id, form, dominios)
          : instituicoes.criar(form, dominios),
      inst.recarregar,
      "Instituição salva com sucesso.",
    );
  }

  async function trocarStatusInstituicao(id, rotulo) {
    return gravar(
      () => instituicoes.trocarStatus(id, rotulo),
      inst.recarregar,
      `Instituição marcada como ${rotulo.toLowerCase()}.`,
    );
  }

  async function salvarRepresentante(form) {
    const existente = reps.itens.some((r) => r.id === form.id);
    return gravar(
      () =>
        existente
          ? representantes.editar(form.id, form)
          : representantes.criar(form),
      reps.recarregar,
      "Representante salvo com sucesso.",
    );
  }

  async function salvarReuniao(form) {
    const existente = meets.itens.some((m) => m.id === form.id);
    return gravar(
      () => (existente ? reunioes.editar(form.id, form) : reunioes.criar(form)),
      meets.recarregar,
      "Reunião salva com sucesso.",
    );
  }

  // O menu vem da API: cada papel enxerga só o que pode acessar.
  const nav = menuDoUsuario(user)
    .filter((item) => ICONES[item.href])
    .map((item) => [item.href, item.rotulo, ICONES[item.href]]);

  const carregando = inst.carregando || reps.carregando || meets.carregando;
  const falha = inst.erro || reps.erro || meets.erro;

  return (
    <div className="workspace">
      <aside className="sidebar">
        <nav aria-label="Menu principal">
          {nav.map(([to, label, Icon]) => (
            <NavLink to={to} key={to}>
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="user-block">
          <CircleUserRound />
          <div>
            <strong>{user.nome}</strong>
            <small>{user.rotuloPapel || user.email}</small>
          </div>
          <button
            className="icon-button"
            aria-label="Sair"
            title="Sair"
            onClick={onLogout}
          >
            <LogOut />
          </button>
        </div>
      </aside>
      <main className="main-content">
        <div className="top-tools">
          <button
            className="notification-button"
            aria-label="Notificações"
            onClick={() => setNotifications(true)}
          >
            <Bell />
          </button>
          {location.pathname === "/dashboard" && (
            <div className="today">
              Hoje,{" "}
              {new Date().toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              <CalendarDays />
            </div>
          )}
        </div>
        {message && (
          <div role="status" className="toast">
            {message}
            <button
              className="text-button"
              onClick={() => setMessage("")}
              aria-label="Fechar aviso"
            >
              ×
            </button>
          </div>
        )}
        {falha && (
          <div role="alert" className="toast">
            {falha}
            <button
              className="text-button"
              onClick={() => {
                inst.recarregar();
                reps.recarregar();
                meets.recarregar();
              }}
            >
              Tentar de novo
            </button>
          </div>
        )}
        {!podeAbrir(user, location.pathname) ? (
          <Card title="Acesso indisponivel"><p>Seu perfil nao tem acesso a esta pagina.</p><NavLink to={nav[0]?.[0] || "/login"}>Voltar</NavLink></Card>
        ) : carregando ? (
          <p className="empty">Carregando dados...</p>
        ) : (
          <Routes>
            <Route
              path="/dashboard"
              element={representanteInstitucional(user) ? <PublicDashboard /> : <Dashboard user={user} meetings={meets.itens} />}
            />
            <Route
              path="/instituicoes"
              element={<InstitutionList institutions={inst.itens} />}
            />
            <Route
              path="/instituicoes/nova"
              element={
                <InstitutionForm key="new" onSave={salvarInstituicao} />
              }
            />
            <Route
              path="/instituicoes/:id/editar"
              element={
                <InstitutionForm
                  key={location.pathname}
                  onSave={salvarInstituicao}
                />
              }
            />
            <Route
              path="/instituicoes/:id"
              element={
                <InstitutionDetail
                  onTrocarStatus={trocarStatusInstituicao}
                  onDelete={(id) =>
                    gravar(
                      () => instituicoes.excluir(id),
                      inst.recarregar,
                      "Instituição excluída.",
                    )
                  }
                />
              }
            />
            <Route
              path="/representantes"
              element={
                <Representatives
                  representatives={reps.itens}
                  institutions={inst.itens}
                />
              }
            />
            <Route
              path="/representantes/novo"
              element={
                <RepresentativeForm
                  key="new-person"
                  representatives={reps.itens}
                  institutions={inst.itens}
                  onSave={salvarRepresentante}
                />
              }
            />
            <Route
              path="/representantes/:id/editar"
              element={
                <RepresentativeForm
                  key={location.pathname}
                  representatives={reps.itens}
                  institutions={inst.itens}
                  onSave={salvarRepresentante}
                />
              }
            />
            <Route
              path="/representantes/:id"
              element={
                <RepresentativeDetail
                  onDeleted={(id) => {
                    reps.setItens((items) => items.filter((item) => item.id !== id));
                    setMessage("Representante excluido com sucesso.");
                    inst.recarregar();
                  }}
                  representatives={reps.itens}
                  institutions={inst.itens}
                />
              }
            />
            <Route
              path="/reunioes"
              element={<Meetings meetings={meets.itens} />}
            />
            <Route
              path="/reunioes/nova"
              element={
                <MeetingForm
                  key="new-meeting"
                  meetings={meets.itens}
                  onSave={salvarReuniao}
                />
              }
            />
            <Route
              path="/reunioes/:id/editar"
              element={
                <MeetingForm
                  key={location.pathname}
                  meetings={meets.itens}
                  onSave={salvarReuniao}
                />
              }
            />
            <Route
              path="/reunioes/:id"
              element={<MeetingDetail meetings={meets.itens} />}
            />
            <Route
              path="/presencas"
              element={
                <>
                  <header className="page-heading">
                    <h1>Presenças</h1>
                    <p>Consulte as reuniões para acompanhar a participação.</p>
                  </header>
                  <Attendance />
                </>
              }
            />
            <Route path="/eventos" element={<Events />} />
            <Route path="/eventos/novo" element={<EventPage creating />} />
            <Route path="/eventos/:id/editar" element={<EventPage editing />} />
            <Route path="/eventos/:id" element={<EventPage />} />
            <Route path="/minha-instituicao" element={<InstitutionArea />} />
            <Route path="/solicitacoes" element={<Approvals />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        )}
      </main>
      {notifications && (
        <Modal title="Notificações" onClose={() => setNotifications(false)}>
          <p className="empty">Nenhuma notificação.</p>
          <button onClick={() => setNotifications(false)}>Fechar</button>
        </Modal>
      )}
    </div>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [verificando, setVerificando] = useState(true);
  const [erroSessao, setErroSessao] = useState("");

  // O cookie sobrevive ao F5, então a sessão é recuperada do servidor.
  useEffect(() => {
    quandoPerderSessao(() => setUser(null));
    sessao
      .atual()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setVerificando(false));
  }, []);

  async function sair() {
    setErroSessao("");
    try {
      await sessao.sair();
    } catch (erro) {
      if (erro.status !== 401) {
        setErroSessao("Não foi possível encerrar a sessão. Verifique sua conexão e tente sair novamente.");
        return;
      }
    }
    setUser(null);
    navigate("/login", { replace: true });
  }

  if (verificando) return <p className="empty">Carregando...</p>;

  return (
    <>
    {erroSessao && <div role="alert" className="toast">{erroSessao}</div>}
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : (
        <LoginPage
          onNavigateToForgot={() => navigate("/esqueci-senha")}
          onLoginSuccess={(loggedUser) => {
            setUser(loggedUser);
            const retorno = new URLSearchParams(location.search).get("retorno");
            navigate(retorno?.startsWith("/checkin/") && !retorno.includes("//") ? retorno : "/dashboard", { replace: true });
          }}
        />
      )} />
      <Route path="/esqueci-senha" element={user ? <Navigate to="/dashboard" replace /> : (
        <EsqueciSenhaPage onBackToLogin={() => navigate("/login")} />
      )} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/publico" element={<PublicDashboard />} />
      <Route path="/checkin/:token" element={<Checkin />} />
      {!user && <Route path="/dashboard" element={<PublicDashboard />} />}
      <Route path="/*" element={user ? (
        <UsuarioContext.Provider value={user}><DominiosProvider>
          <Workspace user={user} onLogout={sair} />
        </DominiosProvider></UsuarioContext.Provider>
      ) : <Navigate to="/login" replace />} />
    </Routes>
    </>
  );
}

export default function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>;
}
