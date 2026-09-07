import InnovationPanel from "../components/InnovationPanel";
import { useState } from "react";
import { Mail, LockKeyhole, Eye, EyeOff } from "lucide-react";
export default function LoginPage({ onNavigateToForgot, onLoginSuccess }) {
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState(
    () => localStorage.getItem("eco-email") || "",
  );
  const [remember, setRemember] = useState(
    () => !!localStorage.getItem("eco-email"),
  );
  return (
    <div className="auth-layout">
      <InnovationPanel />
      <main className="auth-main">
        <section className="auth-card">
          <h1>Bem-vindo(a)!</h1>
          <p>Faça login para acessar o sistema</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (remember) localStorage.setItem("eco-email", email);
              else localStorage.removeItem("eco-email");
              onLoginSuccess({ identifier: email.trim(), name: name.trim() });
            }}
          >
            <label>
              Nome
              <input
                type="text"
                autoComplete="name"
                required
                pattern=".*\S.*"
                title="Informe seu nome."
                placeholder="Digite seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
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
            <button className="primary full">Entrar</button>
            <small className="backend-note">aguardando back</small>
          </form>
        </section>
      </main>
    </div>
  );
}
