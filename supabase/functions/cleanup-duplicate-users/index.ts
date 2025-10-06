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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🧹 Limpando usuários duplicados...');

    // Buscar todos os usuários do auth
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError);
      throw listError;
    }

    // Encontrar usuários "fisioterapia"
    const fisioUsers = users.filter(u => u.email === 'fisioterapia@startfisio.com.br');
    console.log(`📊 Encontrados ${fisioUsers.length} usuários fisioterapia`);

    if (fisioUsers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Nenhum usuário fisioterapia encontrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Manter apenas o mais recente
    const sortedUsers = fisioUsers.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const keepUser = sortedUsers[0];
    const deleteUsers = sortedUsers.slice(1);

    console.log(`✅ Mantendo usuário: ${keepUser.id}`);
    console.log(`🗑️ Deletando ${deleteUsers.length} usuários duplicados`);

    // Deletar usuários duplicados
    for (const user of deleteUsers) {
      console.log(`🗑️ Deletando usuário: ${user.id}`);
      
      // Deletar roles
      await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);
      
      // Deletar profile
      await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', user.id);
      
      // Deletar do auth
      await supabaseAdmin.auth.admin.deleteUser(user.id);
    }

    // Garantir que o usuário mantido tem role de admin
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: keepUser.id,
        role: 'admin'
      }, {
        onConflict: 'user_id,role'
      });

    if (roleError) {
      console.error('❌ Erro ao adicionar role:', roleError);
    } else {
      console.log('✅ Role de admin garantida para usuário mantido');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Limpeza concluída. Mantido usuário ${keepUser.id}, deletados ${deleteUsers.length} duplicados`,
        keptUserId: keepUser.id,
        deletedCount: deleteUsers.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro geral:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
