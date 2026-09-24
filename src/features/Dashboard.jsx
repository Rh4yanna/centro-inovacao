import { Building2, Users, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "./institutions/components";
import { MeetingTable } from "./ManagementPages";
export default function Dashboard({ institutions, user, meetings, representatives }) {
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
            <strong>{representatives.filter(r => r.status === "Ativo").length}</strong>
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
        Indicadores de participação ilustrativos.
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
          <Link className="button primary" to="/reunioes/nova">+ Nova reunião</Link>
        </div>
        <MeetingTable meetings={meetings.filter(m => m.status === 'Agendada').sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time)).slice(0,4)} />
      </Card>
    </>
  );
}
