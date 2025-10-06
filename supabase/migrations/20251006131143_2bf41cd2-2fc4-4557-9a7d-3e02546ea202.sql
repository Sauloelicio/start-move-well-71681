-- Remover a foreign key incorreta que aponta para auth.users
ALTER TABLE public.patient_reports 
DROP CONSTRAINT IF EXISTS patient_reports_patient_id_fkey;

-- Criar a foreign key correta apontando para public.profiles
ALTER TABLE public.patient_reports 
ADD CONSTRAINT patient_reports_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;