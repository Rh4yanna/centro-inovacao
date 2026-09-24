import { useCallback, useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  useLocation,
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
import "./App.css";

const ICONES = {
  "/dashboard": House,
  "/instituicoes": Building2,
  "/representantes": Users,
  "/reunioes": CalendarDays,
  "/presencas": QrCode,
};

function Workspace({ user, onLogout }) {
  const dominios = useDominios();
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState(false);
  const location = useLocation();

  const listarInstituicoes = useCallback(() => instituicoes.listar(), []);
  const listarRepresentantes = useCallback(() => representantes.listar(), []);
  const listarReunioes = useCallback(() => reunioes.listar(), []);

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
  const nav = (user.menu || [])
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
        {carregando ? (
          <p className="empty">Carregando dados...</p>
        ) : (
          <Routes>
            <Route
              path="/dashboard"
              element={<Dashboard user={user} meetings={meets.itens} />}
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
                  <Card title="Registro de presenças">
                    <p className="empty">
                      Abra uma reunião para ver a lista de presença.
                    </p>
                  </Card>
                </>
              }
            />
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

export default function App() {
  const [user, setUser] = useState(null);
  const [forgot, setForgot] = useState(false);
  const [verificando, setVerificando] = useState(true);

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
    try {
      await sessao.sair();
    } catch {
      // Sair não pode falhar para o usuário: o cookie expira sozinho.
    }
    setUser(null);
    setForgot(false);
  }

  if (verificando) return <p className="empty">Carregando...</p>;

  return (
    <BrowserRouter>
      {user ? (
        <DominiosProvider>
          <Workspace user={user} onLogout={sair} />
        </DominiosProvider>
      ) : forgot ? (
        <EsqueciSenhaPage onBackToLogin={() => setForgot(false)} />
      ) : (
        <LoginPage
          onNavigateToForgot={() => setForgot(true)}
          onLoginSuccess={setUser}
        />
      )}
    </BrowserRouter>
  );
}
