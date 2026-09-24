import { useState } from "react";
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
import { initialInstitutions } from "./features/institutions/data";
import { Card, Modal } from "./features/institutions/components";
import { Representatives, RepresentativeForm, RepresentativeDetail, Meetings, MeetingForm, MeetingDetail } from './features/ManagementPages';
import { useLocalCollection } from './features/useLocalCollection';
import { initialMeetings, initialRepresentatives } from './features/managementData';
import "./App.css";
function Workspace({ user, onLogout }) {
  const [institutions, setInstitutions] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem("eco-institutions"));
      return Array.isArray(data) &&
        data.every(
          (i) =>
            i &&
            typeof i.id === "string" &&
            typeof i.name === "string" &&
            typeof i.cnpj === "string" &&
            typeof i.description === "string",
        )
        ? data
        : initialInstitutions;
    } catch {
      return initialInstitutions;
    }
  });
  const [message, setMessage] = useState("");
  const [representatives, saveRepresentative] = useLocalCollection('eco-representatives', initialRepresentatives);
  const [meetings, saveMeeting] = useLocalCollection('eco-meetings', initialMeetings);
  const safelySave = (save, item) => {
    try { save(item); setMessage('Cadastro salvo com sucesso.'); return true; }
    catch { setMessage('Não foi possível salvar no navegador. Verifique o espaço disponível.'); return false; }
  };
  const [notifications, setNotifications] = useState(false);
  const location = useLocation();
  function persist(next) {
    try {
      localStorage.setItem("eco-institutions", JSON.stringify(next));
      setInstitutions(next);
      return true;
    } catch {
      setMessage(
        "Não foi possível salvar no navegador. Verifique o espaço disponível e as permissões de armazenamento.",
      );
      return false;
    }
  }
  function save(institution) {
    const existing = institutions.find((i) => i.id === institution.id);
    institution = {
      ...institution,
      createdBy: existing ? existing.createdBy : user.name,
      updatedBy: user.name,
    };
    const result = persist(
      institutions.some((i) => i.id === institution.id)
        ? institutions.map((i) => (i.id === institution.id ? institution : i))
        : [...institutions, institution],
    );
    if (result) setMessage("Instituição salva com sucesso.");
    return result;
  }
  const nav = [
    ["/dashboard", "Dashboard", House],
    ["/instituicoes", "Instituições", Building2],
    ["/representantes", "Representantes", Users],
    ["/reunioes", "Reuniões", CalendarDays],
    ["/presencas", "Presenças", QrCode],
  ];
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
            <strong>{user.name}</strong>
            <small>{user.identifier}</small>
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
        <Routes>
          <Route
            path="/dashboard"
            element={<Dashboard institutions={institutions} user={user} meetings={meetings} representatives={representatives} />}
          />
          <Route
            path="/instituicoes"
            element={<InstitutionList institutions={institutions} />}
          />
          <Route
            path="/instituicoes/nova"
            element={
              <InstitutionForm
                key="new"
                institutions={institutions}
                onSave={save}
              />
            }
          />
          <Route
            path="/instituicoes/:id/editar"
            element={
              <InstitutionForm
                key={location.pathname}
                institutions={institutions}
                onSave={save}
              />
            }
          />
          <Route
            path="/instituicoes/:id"
            element={
              <InstitutionDetail
                representatives={representatives}
                institutions={institutions}
                onSave={save}
                onDelete={(id) => {
                  const result = persist(
                    institutions.filter((i) => i.id !== id),
                  );
                  if (result) setMessage("Instituição excluída.");
                  return result;
                }}
              />
            }
          />
          <Route path="/representantes" element={<Representatives representatives={representatives} institutions={institutions} />} />
          <Route path="/representantes/novo" element={<RepresentativeForm key="new-person" representatives={representatives} institutions={institutions} onSave={v => safelySave(saveRepresentative,v)} />} />
          <Route path="/representantes/:id/editar" element={<RepresentativeForm key={location.pathname} representatives={representatives} institutions={institutions} onSave={v => safelySave(saveRepresentative,v)} />} />
          <Route path="/representantes/:id" element={<RepresentativeDetail representatives={representatives} institutions={institutions} />} />
          <Route path="/reunioes" element={<Meetings meetings={meetings} />} />
          <Route path="/reunioes/nova" element={<MeetingForm key="new-meeting" meetings={meetings} onSave={v => safelySave(saveMeeting,{...v,organizer:user.name})} />} />
          <Route path="/reunioes/:id/editar" element={<MeetingForm key={location.pathname} meetings={meetings} onSave={v => safelySave(saveMeeting,v)} />} />
          <Route path="/reunioes/:id" element={<MeetingDetail meetings={meetings} />} />
          <Route path="/presencas" element={<><header className="page-heading"><h1>Presenças</h1><p>Consulte as reuniões para acompanhar a participação.</p></header><Card title="Registro de presenças"><p className="empty">Nenhuma presença registrada.</p></Card></>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
      {notifications && (
        <Modal title="Notificações" onClose={() => setNotifications(false)}>
          <p className="empty">aguardando back</p>
          <button onClick={() => setNotifications(false)}>Fechar</button>
        </Modal>
      )}
    </div>
  );
}
export default function App() {
  const [user, setUser] = useState(null);
  const [forgot, setForgot] = useState(false);
  return (
    <BrowserRouter>
      {user ? (
        <Workspace
          user={user}
          onLogout={() => {
            setUser(null);
            setForgot(false);
          }}
        />
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
