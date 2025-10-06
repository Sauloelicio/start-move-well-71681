-- Atribuir role 'admin' ao usuário fisioterapia
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'fisioterapia@startfisio.com.br'
ON CONFLICT (user_id, role) DO NOTHING;

-- Atribuir role 'patient' aos demais usuários que não têm role
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'patient'::app_role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.user_id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Criar trigger para atribuir role 'patient' automaticamente a novos usuários
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atribui role 'patient' por padrão a novos usuários
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'patient'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Criar trigger no auth.users para execução automática
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role();