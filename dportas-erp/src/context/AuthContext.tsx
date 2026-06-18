'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

interface UserProfile {
  id: string;
  email: string;
  nome: string;
  role: 'administrador' | 'vendedor' | 'financeiro';
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, logout: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => { handleAutoLogout(); }, 20 * 60 * 1000); // 20 minutos
    };

    const handleAutoLogout = async () => {
      await supabase.auth.signOut();
      setUser(null);
      router.push('/login');
      alert('Sessão encerrada por inatividade de 20 minutos.');
    };

    const setupListeners = () => {
      window.addEventListener('mousemove', resetInactivityTimer);
      window.addEventListener('keydown', resetInactivityTimer);
      window.addEventListener('click', resetInactivityTimer);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase.from('usuarios').select('*').eq('id', session.user.id).single();
        if (profile) {
          setUser(profile);
          if (_event === 'SIGNED_IN') {
            await fetch('/api/admin/buscar-cpf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tipo: 'LOGIN', usuarioEmail: profile.email, role: profile.role })
            });
          }
          setupListeners();
          resetInactivityTimer();
        }
      } else {
        setUser(null);
        clearTimeout(timeoutId);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);