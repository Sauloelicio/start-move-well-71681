-- Drop the insecure policy that allows anyone to assign any role
DROP POLICY IF EXISTS "Allow role assignment" ON public.user_roles;

-- Create a new secure policy that only allows admins to assign roles
CREATE POLICY "Only admins can assign roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Note: The assign_default_role() trigger will still automatically assign 'patient' role to new users
-- This policy only restricts manual role insertion to admins