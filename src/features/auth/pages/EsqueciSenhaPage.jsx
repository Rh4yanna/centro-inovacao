import InnovationPanel from "../components/InnovationPanel";
import { useState } from "react";
import { post } from "../../../api/cliente";

export default function EsqueciSenhaPage({ onBackToLogin }) {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await post("/api/senha/recuperar", { email: email.trim() });
      setSubmitted(true);
    } catch (e) {
      setErro(e.message);
      setEnviando(false);
    }
  }

  return (
    <div className="auth-layout">
      <InnovationPanel />
      <main className="auth-main">
        <section className="auth-card">
          <h1>Recuperar senha</h1>
          <p>Informe seu e-mail para redefinir sua senha.</p>
          {submitted ? (
            <p className="notice" role="status">
              Se este e-mail estiver cadastrado, você receberá as instruções
              para redefinir a senha.
            </p>
          ) : (
            <form onSubmit={enviar}>
              <label>
                E-mail
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              {erro && (
                <p role="alert" className="error">
                  {erro}
                </p>
              )}
              <button className="primary full" disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar instruções"}
              </button>
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
