CREATE TABLE public.sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    type VARCHAR(30) NOT NULL
        CHECK (type IN (
            'legislacion',
            'jurisprudencia',
            'doctrina',
            'link',
            'bibliografia'
        )),

    title VARCHAR(300) NOT NULL,
    issuer VARCHAR(200),
    url TEXT,

    jurisdiction_id UUID
        REFERENCES public.jurisdictions(id),

    published_at DATE,
    reviewed_at TIMESTAMPTZ,
    notes TEXT,

    visibility VARCHAR(20) NOT NULL DEFAULT 'institution'
        CHECK (visibility IN ('institution', 'private')),

    created_by UUID NOT NULL
        REFERENCES public.users(id),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);