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

    const { email, password, fullName } = await req.json();

    console.log('🔧 Configurando admin:', email);

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email e senha são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se o usuário já existe
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError);
      throw listError;
    }

    let userId: string;
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      console.log('👤 Usuário já existe, atualizando senha...');
      userId = existingUser.id;
      
      // Atualizar senha
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password }
      );

      if (updateError) {
        console.error('❌ Erro ao atualizar senha:', updateError);
        throw updateError;
      }
      
      console.log('✅ Senha atualizada');
    } else {
      console.log('➕ Criando novo usuário...');
      
      // Criar novo usuário
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || email.split('@')[0]
        }
      });

      if (createError) {
        console.error('❌ Erro ao criar usuário:', createError);
        throw createError;
      }

      userId = newUser.user.id;
      console.log('✅ Usuário criado:', userId);
    }

    // Garantir que o profile existe
    const { data: profileData, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (profileCheckError) {
      console.error('❌ Erro ao verificar profile:', profileCheckError);
    }

    if (!profileData) {
      console.log('➕ Criando profile...');
      const { error: profileInsertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          full_name: fullName || email.split('@')[0]
        });

      if (profileInsertError) {
        console.error('❌ Erro ao criar profile:', profileInsertError);
        throw profileInsertError;
      }
    }

    // Garantir que tem role de admin
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'admin'
      }, {
        onConflict: 'user_id,role'
      });

    if (roleError) {
      console.error('❌ Erro ao adicionar role:', roleError);
      throw roleError;
    }

    console.log('✅ Admin configurado com sucesso!');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin configurado com sucesso',
        userId 
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
