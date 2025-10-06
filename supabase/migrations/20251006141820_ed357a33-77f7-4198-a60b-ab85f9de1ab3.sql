-- Phase 1: Critical Database Security Fixes

-- 1.1: Add constraint to ensure users only have ONE role at a time
-- First, clean up any users with multiple roles (keep admin over patient)
DELETE FROM public.user_roles ur1
WHERE ur1.role = 'patient'
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur2
    WHERE ur2.user_id = ur1.user_id
      AND ur2.role = 'admin'
  );

-- Add unique constraint on user_id to enforce single role per user
DROP INDEX IF EXISTS idx_user_roles_user_id;
CREATE UNIQUE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- 1.2: Strengthen RLS policies for profiles table
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Allow initial admin setup" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation after setup" ON public.profiles;

-- Create secure policies that require authentication
CREATE POLICY "Users can insert their own profile during signup"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can insert any profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update existing policies to be more explicit
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 1.3: Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert audit logs (no user access)
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (false);

-- 1.4: Add trigger to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), 'DELETE', 'user_roles', OLD.id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), 'UPDATE', 'user_roles', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), 'INSERT', 'user_roles', NEW.id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER audit_role_changes
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.log_role_change();

-- 1.5: Add validation to patient_reports to ensure data integrity
ALTER TABLE public.patient_reports
ADD CONSTRAINT check_report_format 
CHECK (report_format IN ('text', 'pdf', 'html', 'markdown'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patient_reports_patient_id ON public.patient_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_reports_created_by ON public.patient_reports(created_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);