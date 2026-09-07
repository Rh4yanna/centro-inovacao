import { Rocket, Sparkles } from "lucide-react";
import "./InnovationPanel.css";

export default function InnovationPanel() {
  return (
    <aside
      className="auth-placeholder innovation-panel"
      aria-label="hora da inovação"
    >
      <div className="innovation-stars" aria-hidden="true" />
      <div className="innovation-stage" aria-hidden="true">
        <div className="innovation-orbit orbit-outer" />
        <div className="innovation-orbit orbit-inner" />
        <div className="innovation-core" />
        <div className="rocket-departure">
          <div className="rocket-orbit">
            <div className="rocket-ship">
              <span className="rocket-flame" />
              <Rocket />
            </div>
          </div>
        </div>
      </div>
      <div className="innovation-message" aria-hidden="true">
        <Sparkles />
        <span>É tempo de transformar ideias.</span>
        <h2>
          hora da
          <br />
          <strong>inovação</strong>
        </h2>
        <p>Novas conexões. Infinitas possibilidades.</p>
      </div>
      <span className="innovation-signature" aria-hidden="true">
        ECOSSISTEMA DE INOVAÇÃO
      </span>
    </aside>
  );
}
