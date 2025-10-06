-- Create the fisioterapia admin user in auth.users
-- Note: This creates the authentication entry. The password will need to be set via Supabase Auth
-- The user should use the email: fisioterapia@startfisio.com.br

-- First, ensure the profile exists and update it if needed
INSERT INTO public.profiles (id, full_name, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'fisioterapia',
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE full_name = 'fisioterapia'
);

-- Create a function to handle the fisioterapia user setup
CREATE OR REPLACE FUNCTION public.setup_fisioterapia_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fisio_profile_id uuid;
BEGIN
  -- Get the fisioterapia profile id
  SELECT id INTO fisio_profile_id
  FROM public.profiles
  WHERE full_name = 'fisioterapia'
  LIMIT 1;

  -- Ensure the user has admin role
  IF fisio_profile_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (fisio_profile_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

-- Run the setup
SELECT public.setup_fisioterapia_user();

-- Add a column to patient_reports to store report format
ALTER TABLE public.patient_reports
ADD COLUMN IF NOT EXISTS report_format text DEFAULT 'text' CHECK (report_format IN ('text', 'pdf'));

-- Create an index for faster report queries by patient and date
CREATE INDEX IF NOT EXISTS idx_patient_reports_patient_date 
ON public.patient_reports(patient_id, report_date DESC);