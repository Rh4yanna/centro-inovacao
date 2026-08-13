import { useState } from 'react';

export default function LoginPage({ onNavigateToForgot, onRequestRegister, onLoginSuccess }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('Admin');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulação de login efetuado com sucesso enviando os dados do usuário
    if (onLoginSuccess) {
      onLoginSuccess({
        identifier,
        role
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden p-4">
      {/* Luzes de fundo (Efeito Neon Glow Inovador) */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Card Principal */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6 border border-slate-800/80 relative z-10">
        
        {/* Logo / Ícone de Lâmpada + Cabeçalho */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20">
            💡
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Centro de Inovação
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Guarapuava & Região
            </p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Perfil de Acesso */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Perfil de Acesso
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer"
              >
                <option value="Admin" className="bg-slate-900">Admin</option>
                <option value="Gestor do Centro" className="bg-slate-900">Gestor do Centro</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* E-mail / CNPJ */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              E-mail ou CNPJ
            </label>
            <input
              type="text"
              required
              placeholder="seu@email.com ou CNPJ"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
            />
          </div>

          {/* Senha com Olhinho */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-11 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer focus:outline-none transition-colors"
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? (
                  /* Ícone Olho Fechado (Ocultar) */
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  /* Ícone Olho Aberto (Exibir) */
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12c1.074-4.65 5.022-8 9.964-8s8.89 3.35 9.964 8c-1.074 4.65-5.022 8-9.964 8s-8.89-3.35-9.964-8z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Esqueci minha senha */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onNavigateToForgot}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              Esqueci minha senha
            </button>
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all transform active:scale-[0.98] cursor-pointer text-sm"
          >
            Entrar na Plataforma
          </button>
        </form>

      </div>
    </div>
  );
}