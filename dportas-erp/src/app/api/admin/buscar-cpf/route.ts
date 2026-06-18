import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inicializa o cliente do Supabase com a Service Role Key (Segura, roda apenas no servidor)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tipo, usuarioEmail, role, cpf, logs } = body;

    // 1. Se for um disparo de log de auditoria (Login ou Acesso)
    if (tipo === 'LOGIN' || tipo === 'ACESSO_FINANCEIRO') {
      await supabaseAdmin.from('auditoria_acesso').insert([{
        usuario_email: usuarioEmail,
        acao: tipo === 'LOGIN' ? 'Efetuou login no sistema' : 'Acessou o painel financeiro avançado',
        detalhes: `Usuário com cargo de ${role} realizou a ação.`
      }]);
      return NextResponse.json({ registrado: true });
    }

    // 2. Se for uma busca por CPF efetuada pelo Administrador
    if (tipo === 'BUSCA_CPF') {
      // Registra quem buscou no log de auditoria por segurança (LGPD)
      await supabaseAdmin.from('auditoria_acesso').insert([{
        usuario_email: usuarioEmail,
        acao: 'Busca de CPF de Cliente',
        detalhes: `Consultou o CPF/CNPJ: ${cpf}`
      }]);

      // Faz a busca na tabela de clientes ignorando o RLS padrão usando o cliente Admin
      const { data: cliente, error } = await supabaseAdmin
        .from('clientes')
        .select('*')
        .eq('cpf_cnpj', cpf)
        .single();

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: 'Erro ao buscar no banco de dados.' }, { status: 500 });
      }

      if (!cliente) {
        return NextResponse.json({ encontrado: false, mensagem: 'Nenhum cliente localizado com este CPF/CNPJ.' });
      }

      return NextResponse.json({ encontrado: true, cliente });
    }

    return NextResponse.json({ error: 'Operação inválida.' }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno no servidor.' }, { status: 500 });
  }
}