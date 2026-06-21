'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { Lock, Mail, Eye, EyeOff, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Mantém o estado normal
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true); // CORRIGIDO AQUI: de 'loading(true)' para 'setLoading(true)'

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data?.user) {
        // Busca o perfil do usuário para saber a role (cargo)
        const { data: profile, error: profileError } = await supabase
          .from('usuarios')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        const userRole = profile?.role?.toLowerCase();

        // Redirecionamento correto com 'financeiro-avançado'
        if (userRole === 'administrador' || userRole === 'financeiro') {
          router.push('/dashboard/admin/financeiro-avançado');
        } else if (userRole === 'vendedor') {
          router.push('/portal-entrega');
        } else {
          setError('Usuário sem permissões configuradas no sistema.');
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao efetuar login. Verifique suas credenciais.');
      }
    } finally {
      setLoading(false); // CORRIGIDO AQUI TAMBÉM: de 'loading(false)' para 'setLoading(false)'
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 font-sans p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full"></div>
        
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-3 text-amber-500">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">ERP dportas</h1>
          <p className="text-sm text-slate-400 mt-1">Acesse sua conta corporativa</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">E-mail Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.nome@dportas.com.br"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Senha de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-600 text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/10 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}