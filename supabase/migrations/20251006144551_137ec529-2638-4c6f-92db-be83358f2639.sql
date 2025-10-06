-- Atualizar o usuário fisioterapia@startfisio.com.br para admin
UPDATE public.user_roles 
SET role = 'admin'::app_role 
WHERE user_id = 'fa40432d-f597-48ee-a40c-a4f9fde599a7';