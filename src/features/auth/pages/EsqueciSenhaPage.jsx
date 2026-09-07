import InnovationPanel from "../components/InnovationPanel";
import { useState } from "react";
export default function EsqueciSenhaPage({ onBackToLogin }) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="auth-layout">
      <InnovationPanel />
      <main className="auth-main">
        <section className="auth-card">
          <h1>Recuperar senha</h1>
          <p>Informe seu e-mail para redefinir sua senha.</p>
          {submitted ? (
            <p className="notice" role="status">
              aguardando back
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
            >
              <label>
                E-mail
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Digite seu e-mail"
                />
              </label>
              <button className="primary full">Enviar instruções</button>
            </form>
          )}
          <button className="text-button back-login" onClick={onBackToLogin}>
            ← Voltar para o login
          </button>
        </section>
      </main>
    </div>
  );
}
