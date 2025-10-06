-- Remove a foreign key constraint da tabela user_roles
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Comentário: Agora os roles podem ser atribuídos independentemente da tabela auth.users