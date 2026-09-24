import InnovationPanel from "../components/InnovationPanel";
import { useState } from "react";
import { Mail, LockKeyhole, Eye, EyeOff } from "lucide-react";
import { sessao } from "../../../api/recursos";

export default function LoginPage({ onNavigateToForgot, onLoginSuccess }) {
  const [show, setShow] = useState(false);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [email, setEmail] = useState(
    () => localStorage.getItem("eco-email") || "",
  );
  const [remember, setRemember] = useState(
    () => !!localStorage.getItem("eco-email"),
  );

  async function entrar(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const usuario = await sessao.entrar(email.trim(), senha);
      if (remember) localStorage.setItem("eco-email", email.trim());
      else localStorage.removeItem("eco-email");
      onLoginSuccess(usuario);
    } catch (e) {
      // 401 é senha errada; o resto é problema de rede ou do servidor.
      setErro(
        e.status === 401 ? "E-mail ou senha incorretos." : e.message,
      );
      setEnviando(false);
    }
  }

  return (
    <div className="auth-layout">
      <InnovationPanel />
      <main className="auth-main">
        <section className="auth-card">
          <h1>Bem-vindo(a)!</h1>
          <p>Faça login para acessar o sistema</p>
          <form onSubmit={entrar}>
            <label>
              E-mail
              <div className="input-icon">
                <Mail />
                <input
                  type="email"
                  autoComplete="username"
                  required
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </label>
            <label>
              Senha
              <div className="input-icon">
                <LockKeyhole />
                <input
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </label>
            <div className="login-options">
              <label className="check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Lembrar-me
              </label>
              <button
                type="button"
                className="text-button"
                onClick={onNavigateToForgot}
              >
                Esqueceu sua senha?
              </button>
            </div>
            {erro && (
              <p role="alert" className="error">
                {erro}
              </p>
            )}
            <button className="primary full" disabled={enviando}>
              {enviando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
