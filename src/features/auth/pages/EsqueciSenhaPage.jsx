import { useState } from 'react';

export default function EsqueciSenhaPage({ onBackToLogin }) {
  const [identifier, setIdentifier] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulação de requisição
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden p-4">
      {/* Luzes de fundo (Neon Glow) */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Card Principal */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6 border border-slate-800/80 relative z-10">
        
        {!isSubmitted ? (
          /* ESTADO 1: FORMULÁRIO */
          <>
            {/* Ícone e Cabeçalho */}
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/10">
                🔑
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  Recuperar Senha
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Informe suas credenciais para receber o link de redefinição.
                </p>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  E-mail, CPF ou CNPJ
                </label>
                <input
                  type="text"
                  required
                  placeholder="exemplo@empresa.com ou CPF/CNPJ"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all transform active:scale-[0.98] cursor-pointer text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Enviando...</span>
                ) : (
                  <span>Enviar instruções</span>
                )}
              </button>
            </form>

            {/* Link Voltar */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                ← Voltar para o login
              </button>
            </div>
          </>
        ) : (
          /* ESTADO 2: SUCESSO */
          <div className="text-center space-y-4 py-2">
            <div className="mx-auto w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-emerald-500/10">
              ✓
            </div>
            
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-white">Verifique seu e-mail</h2>
              <p className="text-sm text-slate-400">
                Enviamos as instruções para o cadastro vinculado a:
              </p>
              <p className="text-sm font-semibold text-blue-400 break-all">{identifier}</p>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400">
              Caso não encontre na caixa de entrada, verifique a pasta de <b>Spam</b> ou Lixo Eletrônico.
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-all text-xs cursor-pointer"
              >
                Voltar para o Login
              </button>

              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="w-full py-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                Não recebeu? Tentar novamente
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}