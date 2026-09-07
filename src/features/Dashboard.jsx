import { useState } from "react";
import { Building2, Users, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, Modal } from "./institutions/components";
import { meetings } from "./institutions/data";
export default function Dashboard({ institutions, user }) {
  const [meeting, setMeeting] = useState(null);
  const [allMeetings, setAllMeetings] = useState(meetings);
  const [creating, setCreating] = useState(false);
  return (
    <>
      <header className="page-heading">
        <h1>Olá, {user.name}</h1>
        <p>Acompanhe os principais indicadores de hoje.</p>
      </header>
      <Card className="stats">
        <div>
          <span className="stat-icon">
            <Building2 />
          </span>
          <section>
            <h2>Instituições</h2>
            <p>
              Instituições ativas cadastradas
              <br />
              no ecossistema.
            </p>
            <strong>
              {institutions.filter((i) => i.status === "Ativa").length}
            </strong>
            <small> instituições</small>
          </section>
        </div>
        <div>
          <span className="stat-icon">
            <Users />
          </span>
          <section>
            <h2>Representações</h2>
            <p>
              Mais representantes engajados
              <br />
              impulsionando a colaboração.
            </p>
            <strong>126</strong>
            <small> representantes</small>
          </section>
        </div>
        <div>
          <span className="stat-icon">
            <TrendingUp />
          </span>
          <section>
            <h2>Presença</h2>
            <p>
              A média de presença nas reuniões
              <br />
              se manteve acima da meta.
            </p>
            <strong>88%</strong>
            <small> média de presença</small>
          </section>
        </div>
      </Card>
      <p className="backend-caption">
        aguardando back
      </p>
      <div className="two-columns charts">
        <Card>
          <h2>Evolução da participação</h2>
          <p className="muted">Participação dos representantes nas reuniões.</p>
          <svg
            className="line-chart"
            viewBox="0 0 520 225"
            role="img"
            aria-label="Participação: fevereiro 50%, março 65%, abril 50%, maio 80%, junho 75%, julho 95%"
          >
            <defs>
              <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a568ed" stopOpacity=".35" />
                <stop offset="100%" stopColor="#a568ed" stopOpacity=".02" />
              </linearGradient>
            </defs>
            {[0, 25, 50, 75, 100].map((v, j) => (
              <g key={v}>
                <line
                  x1="48"
                  x2="505"
                  y1={190 - j * 40}
                  y2={190 - j * 40}
                  stroke="#eeeaf3"
                />
                <text x="28" y={194 - j * 40} textAnchor="end">
                  {v}%
                </text>
              </g>
            ))}
            <path
              d="M48 110 C80 96 99 77 139 86 S199 126 230 110 S285 49 322 62 S384 77 413 70 S474 49 505 38 L505 190 L48 190Z"
              fill="url(#area)"
            />
            <path
              d="M48 110 C80 96 99 77 139 86 S199 126 230 110 S285 49 322 62 S384 77 413 70 S474 49 505 38"
              fill="none"
              stroke="#7414d9"
              strokeWidth="2.5"
            />
            {["Fev", "Mar", "Abr", "Mai", "Jun", "Jul"].map((m, j) => (
              <g key={m}>
                <circle
                  cx={[48, 139, 230, 322, 413, 505][j]}
                  cy={[110, 86, 110, 62, 70, 38][j]}
                  r="4.5"
                  fill="#7414d9"
                  stroke="white"
                  strokeWidth="1.5"
                />
                <text x={48 + j * 91} y="215" textAnchor="middle">
                  {m}
                </text>
              </g>
            ))}
          </svg>
        </Card>
        <Card>
          <h2>Participação por instituição</h2>
          <p className="muted">Top 5 instituições por participação média.</p>
          <div className="bar-chart">
            {[
              ["Universidade", 94],
              ["Faculdade", 81],
              ["Centro Inovação", 78],
              ["Startup", 76],
              ["Incubadora", 62],
            ].map(([name, value]) => (
              <div key={name}>
                <span>{name}</span>
                <div className="track">
                  <div style={{ width: `${value}%` }} />
                </div>
                <span>{value}%</span>
              </div>
            ))}
          </div>
          <Link className="text-button see-all" to="/instituicoes">
            Ver todas <ArrowRight />
          </Link>
        </Card>
      </div>
      <Card>
        <div className="section-heading">
          <h2>Próximas reuniões</h2>
          <button className="primary" onClick={() => setCreating(true)}>
            + Nova reunião
          </button>
        </div>
        <div className="table-scroll">
          <table className="meetings-table">
            <thead>
              <tr>
                {[
                  "Data",
                  "Reunião",
                  "Horário",
                  "Local",
                  "Participantes confirmados",
                  "Ações",
                ].map((v) => (
                  <th key={v}>{v}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allMeetings.map((m) => (
                <tr key={m.id}>
                  <td>
                    <span className="date-badge">
                      {m.day}
                      <small>{m.month || "SET"}</small>
                    </span>
                  </td>
                  <td>
                    <strong>{m.name}</strong>
                    <small>{m.description}</small>
                  </td>
                  <td>{m.time}</td>
                  <td>
                    <strong>{m.place}</strong>
                    <small>{m.address}</small>
                  </td>
                  <td className="purple">{m.count} confirmados</td>
                  <td>
                    <button onClick={() => setMeeting(m)}>
                      Ver reunião <ArrowRight />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {creating && (
        <Modal title="Nova reunião" onClose={() => setCreating(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = Object.fromEntries(new FormData(e.currentTarget));
              setAllMeetings([
                ...allMeetings,
                {
                  ...data,
                  id: crypto.randomUUID(),
                  day: data.date.slice(8),
                  month: new Date(data.date + "T12:00:00")
                    .toLocaleDateString("pt-BR", { month: "short" })
                    .replace(".", "")
                    .toUpperCase(),
                  count: 0,
                },
              ]);
              setCreating(false);
            }}
          >
            <label>
              Nome da reunião
              <input name="name" required />
            </label>
            <div className="two-columns meeting-fields">
              <label>
                Data
                <input name="date" type="date" required />
              </label>
              <label>
                Horário
                <input name="time" type="time" required />
              </label>
            </div>
            <label>
              Local
              <input name="place" required />
            </label>
            <label className="meeting-fields">
              Endereço
              <input name="address" />
            </label>
            <label>
              Descrição
              <textarea name="description" />
            </label>
            <p className="muted meeting-fields">
              aguardando back
            </p>
            <div className="modal-actions">
              <button type="button" onClick={() => setCreating(false)}>
                Cancelar
              </button>
              <button className="primary">Criar reunião</button>
            </div>
          </form>
        </Modal>
      )}
      {meeting && (
        <Modal title={meeting.name} onClose={() => setMeeting(null)}>
          <p>{meeting.description}</p>
          <dl className="info-grid">
            <div>
              <dt>Data e horário</dt>
              <dd>
                {meeting.date
                  ? new Date(meeting.date + "T12:00:00").toLocaleDateString(
                      "pt-BR",
                    )
                  : `${meeting.day}/09/2026`}{" "}
                às {meeting.time}
              </dd>
            </div>
            <div>
              <dt>Local</dt>
              <dd>
                {meeting.place}
                <br />
                {meeting.address}
              </dd>
            </div>
            <div>
              <dt>Participantes confirmados</dt>
              <dd>{meeting.count}</dd>
            </div>
          </dl>
          <p className="notice">aguardando back</p>
          <button onClick={() => setMeeting(null)}>Fechar</button>
        </Modal>
      )}
    </>
  );
}
