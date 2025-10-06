-- Permitir setup inicial: criar o primeiro usuário "fisioterapia"
CREATE POLICY "Allow initial admin setup"
ON public.profiles
FOR INSERT
TO anon
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM profiles WHERE full_name = 'fisioterapia'
  )
);

-- Permitir criação de novos perfis após o setup inicial
CREATE POLICY "Allow profile creation after setup"
ON public.profiles
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles WHERE full_name = 'fisioterapia'
  )
);

-- Permitir criação de roles para novos usuários
CREATE POLICY "Allow role assignment"
ON public.user_roles
FOR INSERT
TO anon
WITH CHECK (true);