CREATE TABLE public.cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(200) NOT NULL,

    description TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'abierto'
        CHECK (status IN ('abierto', 'archivado')),

    created_by UUID NOT NULL
        REFERENCES public.users(id),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);