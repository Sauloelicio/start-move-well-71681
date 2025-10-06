import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': window.location.origin || 'https://start-move-well.lovable.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verificar se o usuário que está fazendo a requisição é admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se o usuário tem role admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!roleData || roleData.role !== 'admin') {
      console.log('❌ Usuário não é admin');
      return new Response(
        JSON.stringify({ error: 'Apenas administradores podem deletar usuários' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'ID do usuário é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🗑️ Deletando usuário: ${userId}`);

    // Verificar se o usuário a ser deletado não é admin
    const { data: targetRoleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (targetRoleData && targetRoleData.role === 'admin') {
      return new Response(
        JSON.stringify({ error: 'Não é possível excluir administradores' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Tentar deletar do auth.users primeiro
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.warn('⚠️ Erro ao deletar do auth.users:', deleteError.message);
      // Se o usuário não existe no auth, vamos deletar os registros órfãos
      if (deleteError.message.includes('User not found') || deleteError.status === 404) {
        console.log('🧹 Limpando registros órfãos de profiles e user_roles...');
        
        // Deletar de user_roles
        const { error: roleDeleteError } = await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
        
        if (roleDeleteError) {
          console.error('❌ Erro ao deletar role:', roleDeleteError);
        }
        
        // Deletar de profiles
        const { error: profileDeleteError } = await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('id', userId);
        
        if (profileDeleteError) {
          console.error('❌ Erro ao deletar profile:', profileDeleteError);
          throw profileDeleteError;
        }
        
        console.log('✅ Registros órfãos deletados com sucesso');
        return new Response(
          JSON.stringify({ success: true, message: 'Registros órfãos deletados com sucesso' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Outros erros devem ser lançados
      throw deleteError;
    }

    console.log('✅ Usuário deletado com sucesso');

    return new Response(
      JSON.stringify({ success: true, message: 'Usuário deletado com sucesso' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar usuário';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
