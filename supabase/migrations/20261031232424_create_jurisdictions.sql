CREATE TABLE public.jurisctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL,

    score VARCHAR(50) NOT NULL
        CHECK (scope IN ('provincial', 'nacional', 'federal')),

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Seed inicial: corrientes

INSERT INTO public.jurisctions (name, scope)
VALUES ('Corrientes', 'provincial');