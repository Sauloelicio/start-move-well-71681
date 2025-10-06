-- Remove a foreign key constraint que está causando o erro
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Comentário: Agora os IDs dos profiles podem ser gerados independentemente
-- sem precisar existir na tabela auth.users