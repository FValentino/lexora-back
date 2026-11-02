CREATE TABLE public.jurisdictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    scope VARCHAR(50) NOT NULL
        CHECK (scope IN ('provincial', 'nacional', 'federal')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.jurisdictions (name, scope)
VALUES ('Corrientes', 'provincial');