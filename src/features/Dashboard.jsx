import { useEffect, useState } from "react";
import { Building2, Users, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "./institutions/components";
import { MeetingTable } from "./ManagementPages";
import { indicadores } from "../api/recursos";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// "2026-09" ou "2026-09-01" viram "Set".
function rotuloDoMes(mes) {
  const m = Number(String(mes).slice(5, 7));
  return MESES[m - 1] || String(mes);
}

function LinhaDaEvolucao({ pontos }) {
  if (pontos.length < 2)
    return <p className="empty">Dados insuficientes para montar o gráfico.</p>;

  const x = (j) => 48 + (j * (505 - 48)) / (pontos.length - 1);
  const y = (v) => 190 - (v / 100) * 160;
  const linha = pontos.map((p, j) => `${x(j)} ${y(p.percentual ?? 0)}`).join(" L ");

  return (
    <svg
      className="line-chart"
      viewBox="0 0 520 225"
      role="img"
      aria-label={`Participação: ${pontos.map((p) => `${rotuloDoMes(p.mes)} ${p.percentual ?? 0}%`).join(", ")}`}
    >
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a568ed" stopOpacity=".35" />
          <stop offset="100%" stopColor="#a568ed" stopOpacity=".02" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((v, j) => (
        <g key={v}>
          <line x1="48" x2="505" y1={190 - j * 40} y2={190 - j * 40} stroke="#eeeaf3" />
          <text x="28" y={194 - j * 40} textAnchor="end">
            {v}%
          </text>
        </g>
      ))}
      <path d={`M ${linha} L 505 190 L 48 190Z`} fill="url(#area)" />
      <path d={`M ${linha}`} fill="none" stroke="#7414d9" strokeWidth="2.5" />
      {pontos.map((p, j) => (
        <g key={p.mes}>
          <circle
            cx={x(j)}
            cy={y(p.percentual ?? 0)}
            r="4.5"
            fill="#7414d9"
            stroke="white"
            strokeWidth="1.5"
          />
          <text x={x(j)} y="215" textAnchor="middle">
            {rotuloDoMes(p.mes)}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function Dashboard({ user, meetings }) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let vivo = true;
    indicadores
      .obter()
      .then((d) => vivo && setDados(d))
      .catch((e) => vivo && setErro(e.message));
    return () => {
      vivo = false;
    };
  }, []);

  const c = dados?.cartoes;
  const evolucao = dados?.evolucaoParticipacao || [];
  const porInstituicao = dados?.participacaoPorInstituicao || [];

  return (
    <>
      <header className="page-heading">
        <h1>Olá, {user.nome}</h1>
        <p>Acompanhe os principais indicadores de hoje.</p>
      </header>
      {erro && (
        <p role="alert" className="error">
          {erro}
        </p>
      )}
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
            <strong>{c ? c.instituicoes.ativas : "—"}</strong>
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
            <strong>{c ? c.representantesAtivos : "—"}</strong>
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
              Média de presença nas reuniões
              <br />
              já realizadas.
            </p>
            <strong>{c?.mediaPresenca == null ? "—" : `${c.mediaPresenca}%`}</strong>
            <small> média de presença</small>
          </section>
        </div>
      </Card>
      <div className="two-columns charts">
        <Card>
          <h2>Evolução da participação</h2>
          <p className="muted">Participação dos representantes nas reuniões.</p>
          <LinhaDaEvolucao pontos={evolucao} />
        </Card>
        <Card>
          <h2>Participação por instituição</h2>
          <p className="muted">Top 5 instituições por participação média.</p>
          <div className="bar-chart">
            {porInstituicao.slice(0, 5).map((p) => (
              <div key={p.instituicaoId}>
                <span>{p.instituicao}</span>
                <div className="track">
                  <div style={{ width: `${p.percentual}%` }} />
                </div>
                <span>{p.percentual}%</span>
              </div>
            ))}
          </div>
          {!porInstituicao.length && (
            <p className="empty">Nenhuma participação registrada.</p>
          )}
          <Link className="text-button see-all" to="/instituicoes">
            Ver todas <ArrowRight />
          </Link>
        </Card>
      </div>
      <Card>
        <div className="section-heading">
          <h2>Próximas reuniões</h2>
          <Link className="button primary" to="/reunioes/nova">
            + Nova reunião
          </Link>
        </div>
        <MeetingTable
          meetings={meetings
            .filter((m) => m.status === "Agendada")
            .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
            .slice(0, 4)}
        />
      </Card>
    </>
  );
}
