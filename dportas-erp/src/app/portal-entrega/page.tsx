'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { Truck, Package, MapPin, Calendar, Search, RefreshCw, LogOut, User, CheckCircle2 } from 'lucide-react';

export default function PortalEntregaPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [cpfCliente, setCpfCliente] = useState('');
  const [pedido, setPedido] = useState<any>(null);
  const [buscaLoading, setBuscaLoading] = useState(false);
  const [buscaErro, setBuscaErro] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleRastrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpfCliente.trim()) return;

    setBuscaLoading(true);
    setBuscaErro('');
    setPedido(null);

    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('nome_completo, cpf_cnpj, status_entrega')
        .eq('cpf_cnpj', cpfCliente)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        setBuscaErro('Nenhum pedido ou registro logístico localizado para o documento informado.');
      } else {
        setPedido(data);
      }
    } catch (err: any) {
      setBuscaErro(err.message || 'Erro ao consultar status de entrega.');
    } finally {
      setBuscaLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mr-2" />
        Carregando portal logístico...
      </div>
    );
  }

  if (!user) return <div className="min-h-screen bg-slate-950"></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-900 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Portal de Entregas dportas</h1>
            <p className="text-xs text-slate-400">Módulo de Rastreamento e Logística</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-200">{user.nome}</p>
            <p className="text-xs text-slate-400 font-medium capitalize">Operador: {user.role}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 bg-slate-950 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-xl transition-all"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center max-w-xl mx-auto space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white flex items-center justify-center">
              <Package className="w-4 h-4 text-amber-500 mr-2" />
              Localizar Carga de Portas
            </h2>
            <p className="text-xs text-slate-400">
              Insira o CPF ou CNPJ do cliente para puxar o andamento da fábrica e despacho.
            </p>
          </div>

          <form onSubmit={handleRastrear} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={cpfCliente}
                onChange={(e) => setCpfCliente(e.target.value)}
                placeholder="CPF ou CNPJ (apenas números)"
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500/50 outline-none transition-all placeholder:text-slate-600 text-white"
              />
            </div>
            <button
              type="submit"
              disabled={buscaLoading}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-slate-950 font-semibold rounded-xl text-xs transition-all flex items-center justify-center shadow-md shrink-0"
            >
              {buscaLoading ? 'Rastreando...' : 'Consultar Rota'}
            </button>
          </form>

          {buscaErro && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
              {buscaErro}
            </div>
          )}
        </div>

        {pedido && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 max-w-xl mx-auto animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{pedido.nome_completo}</h3>
                  <p className="text-xs text-slate-500">Doc: {pedido.cpf_cnpj}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-2xs font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                <span>Em Processamento</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Linha de Despacho</h4>
              
              <div className="relative border-l-2 border-slate-800 ml-3 pl-6 space-y-5 py-1">
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-amber-500 border-4 border-slate-950 shadow-md"></div>
                  <div className="text-xs">
                    <span className="font-bold text-white flex items-center">
                      <MapPin className="w-3 h-3 text-amber-500 mr-1" /> Status Atual Informado pela Fábrica:
                    </span>
                    <p className="text-slate-300 mt-1 bg-slate-950 p-3 rounded-lg border border-slate-800/80 italic">
                      "{pedido.status_entrega || 'Pedido aceito. Aguardando montagem do lote das portas.'}"
                    </p>
                  </div>
                </div>

                <div className="relative opacity-60">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center border border-slate-950 text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 bg-slate-950 rounded-full" />
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-slate-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" /> Confirmação do Pedido
                    </span>
                    <p className="text-slate-500 mt-0.5">Pagamento liberado pelo financeiro e ordem de corte emitida.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}