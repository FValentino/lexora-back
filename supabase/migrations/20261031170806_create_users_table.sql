-- Unificar nombre y apellido en full_name
ALTER TABLE public.users
ADD COLUMN full_name VARCHAR(150);

UPDATE public.users
SET full_name = CONCAT(first_name, ' ', last_name);

ALTER TABLE public.users
ALTER COLUMN full_name SET NOT NULL;

-- Ajustar el tipo de password_hash
ALTER TABLE public.users
ALTER COLUMN password_hash TYPE VARCHAR(255);

-- Eliminar columnas que ya no forman parte del diseño
ALTER TABLE public.users
DROP COLUMN first_name,
DROP COLUMN last_name,
DROP COLUMN bar_association_registration,
DROP COLUMN updated_at;

-- Eliminar el índice adicional de email
DROP INDEX IF EXISTS public.users_email_lower_idx;

-- Eliminar el trigger anterior
DROP TRIGGER IF EXISTS users_updated_at ON public.users;