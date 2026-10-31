INSERT INTO public.jurisdictions (name, code)
VALUES ('Corrientes', 'COR')
ON CONFLICT (code) DO NOTHING;