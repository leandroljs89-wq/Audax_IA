import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, ArrowLeft, AlertCircle, Mail, Loader2, Shield } from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (page: 'home' | 'booking' | 'admin' | 'admin-login') => void;
}

export default function AdminLoginPage({ onNavigate }: AdminLoginPageProps) {
  const { loginAdmin } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await loginAdmin(email, password);
      if (success) {
        onNavigate('admin');
      } else {
        setError('Credenciais inválidas. Verifique seu email e senha.');
        setPassword('');
      }
    } catch (err) {
      setError('Erro ao conectar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[200px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-600/5 rounded-full blur-[150px]"></div>
      </div>
      
      <div className="relative max-w-md w-full">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar ao início</span>
        </button>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
              <Shield className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Área <span className="text-amber-500">Restrita</span>
            </h1>
            <p className="text-zinc-400 text-sm">Acesso exclusivo para profissionais</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-2">
                <Mail className="w-4 h-4 inline mr-1.5 text-amber-500" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="seu@email.com"
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-2">
                <Lock className="w-4 h-4 inline mr-1.5 text-amber-500" />
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-900 font-bold py-3.5 rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Entrar
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <p className="text-zinc-500 text-xs">
              <Lock className="w-3 h-3 inline mr-1" />
              Conexão segura e criptografada
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
