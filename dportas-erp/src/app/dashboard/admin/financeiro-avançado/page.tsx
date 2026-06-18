'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import { 
  ShieldAlert, Search, DollarSign, ArrowUpRight, ArrowDownRight, 
  Users, Landmark, FileSpreadsheet, TrendingUp, RefreshCw, LogOut 
} from 'lucide-react';

export default function FinanceiroAvancadoPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [cpfBusca, setCpfBusca] = useState('');
  const [resultadoCliente, setResultadoCliente] = useState<any>(null);
  const [buscaLoading, setBuscaLoading] = useState(false);
  const [buscaErro, setBuscaErro] = useState('');

  // Estados dos KPIs Financeiros simulando dados do ERP
  const [kpis, setKpis] = useState({
    faturamentoMensal: 142500.00,
    recebidos: 98400.00,
    inadimplencia: 12.4,
    vendasAtivas: 48
  });

  useEffect(() => {
    // Se o carregamento do login terminou e o usuário não é admin/financeiro, barra o acesso
    if (!loading && (!user || (user.role !== 'administrador' && user.role !== 'financeiro'))) {
      router.push('/login');
    }

    // Registra no log de auditoria via API que o Admin entrou na tela financeira
    if (user && (user.role === 'administrador' || user.role === 'financeiro')) {
      fetch('/api/admin/buscar-cpf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'ACESSO_FINANCEIRO', usuarioEmail: user.email, role: user.role })
      }).catch(err => console.error('Erro ao registrar log de auditoria', err));
    }
  }, [user, loading, router]);

  const handleBuscarCPF = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpfBusca.trim()) return;

    setBuscaLoading(true);
    setBuscaErro('');
    setResultadoCliente(null);

    try {
      // Dispara a busca através da nossa Serverless API Route segura
      const res = await fetch('/api/admin/buscar-cpf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tipo: 'BUSCA_CPF', 
          usuarioEmail: user?.email, 
          cpf: cpfBusca 
        })
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      if (data.encontrado) {
        setResultadoCliente(data.cliente);
      } else {
        setBuscaErro(data.mensagem || 'Cliente não localizado.');
      }
    } catch (err: any) {
      setBuscaErro(err.message || 'Falha ao processar a consulta de CPF.');
    } finally {
      setBuscaLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mr-2" />
        Carregando painel de segurança...
      </div>
    );
  }

  // Se não houver usuário elegível, renderiza tela preta de bloqueio preventiva
  if (!user || (user.role !== 'administrador' && user.role !== 'financeiro')) {
    return <div className="min-h-screen bg-slate-950"></div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header Superior Principal */}
      <header className="border-b border-slate-900 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg font-bold text-xs uppercase tracking-wider">
            Admin Mode
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">ERP dportas</h1>
            <p className="text-xs text-slate-400">Gestão Corporativa de Alta Segurança</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-200">{user.nome}</p>
            <p className="text-xs text-amber-500 font-medium capitalize">{user.role}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 bg-slate-950 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-xl transition-all"
            title="Sair do Sistema"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Alerta de Auditoria Ativa (LGPD Compliance) */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-start space-x-3 text-sm">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Auditoria Rígida Ativada:</span> Cada consulta de CPF, alteração financeira ou visualização de relatório realizada neste painel é vinculada à sua assinatura digital corporativa e salva permanentemente no log do sistema do Supabase de acordo com as diretrizes da LGPD.
          </div>
        </div>

        {/* Grade de Cards Financeiros (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Faturamento / Mês</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-white">R$ {kpis.faturamentoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <span className="text-xs text-emerald-400 font-medium flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +14.2% vs mês anterior
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Recebido Líquido</span>
              <Landmark className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-white">R$ {kpis.recebidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <span className="text-xs text-slate-400 font-medium flex items-center mt-1">
              Reflete liquidações de portais de entrega
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Taxa Inadimplência</span>
              <TrendingUp className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-white">{kpis.inadimplencia}%</p>
            <span className="text-xs text-red-400 font-medium flex items-center mt-1">
              <ArrowDownRight className="w-3 h-3 mr-0.5" /> -1.8% de redução ativa
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Contratos de Entrega</span>
              <Users className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-white">{kpis.vendasAtivas} Clientes</p>
            <span className="text-xs text-amber-400 font-medium flex items-center mt-1">
              Monitorados via painel de vendedores
            </span>
          </div>
        </div>

        {/* Módulo de Busca Avançada LGPD Bypass (RLS Override) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0 lg:pr-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center">
                <FileSpreadsheet className="w-4 h-4 text-amber-500 mr-2" />
                Consulta Direta de Cliente
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Acesso master para localizar registros bloqueados por RLS padrão utilizando encapsulamento Serverless.
              </p>
            </div>

            <form onSubmit={handleBuscarCPF} className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={cpfBusca}
                  onChange={(e) => setCpfBusca(e.target.value)}
                  placeholder="Digite o CPF ou CNPJ puro"
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500/50 outline-none transition-all placeholder:text-slate-600 text-white"
                />
              </div>
              <button
                type="submit"
                disabled={buscaLoading}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-slate-950 font-semibold rounded-xl text-xs transition-all flex items-center justify-center shadow-md shadow-amber-500/5"
              >
                {buscaLoading ? 'Processando Chaves...' : 'Executar Busca Master'}
              </button>
            </form>

            {buscaErro && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs text-center">
                {buscaErro}
              </div>
            )}
          </div>

          {/* Painel de Exibição dos Dados do Cliente Encontrado */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            {resultadoCliente ? (
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">{resultadoCliente.nome_completo}</h4>
                    <p className="text-xs text-slate-500">CPF/CNPJ: {resultadoCliente.cpf_cnpj}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wider ${
                    resultadoCliente.status_financeiro === 'adimplente' 
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}>
                    {resultadoCliente.status_financeiro}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-0.5">E-mail de Contato</span>
                    <span className="text-slate-200 font-medium break-all">{resultadoCliente.email || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Telefone Comercial</span>
                    <span className="text-slate-200 font-medium">{resultadoCliente.telefone || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Contrato de Entrega</span>
                    <span className="text-slate-200 font-medium">Cód: #{resultadoCliente.id?.slice(0, 8)}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/50 text-xs">
                  <span className="text-slate-400 font-semibold block mb-1">Status de Entrega Logística (Visão do Vendedor):</span>
                  <p className="text-slate-300">
                    {resultadoCliente.status_entrega || 'Nenhuma rota ou entrega despachada para este cliente até o momento.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
                <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                <p className="text-xs font-medium">Nenhum dado consultado neste ciclo</p>
                <p className="text-2xs text-slate-700 mt-0.5">Aguardando inserção e execução de chaves master via terminal lateral</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}