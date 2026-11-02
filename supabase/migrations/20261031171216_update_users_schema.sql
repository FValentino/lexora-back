-- Eliminar elementos del esquema anterior
DROP TRIGGER IF EXISTS users_updated_at ON public.users;
DROP FUNCTION IF EXISTS public.set_updated_at();

DROP INDEX IF EXISTS public.users_email_lower_idx;

-- Crear la nueva columna
ALTER TABLE public.users
ADD COLUMN full_name VARCHAR(150);

-- Migrar los nombres existentes
UPDATE public.users
SET full_name = CONCAT(first_name, ' ', last_name);

-- Establecer restricciones
ALTER TABLE public.users
ALTER COLUMN full_name SET NOT NULL,
ALTER COLUMN password_hash TYPE VARCHAR(255);

-- Eliminar columnas que ya no necesitamos
ALTER TABLE public.users
DROP COLUMN first_name,
DROP COLUMN last_name,
DROP COLUMN bar_association_registration,
DROP COLUMN updated_at;