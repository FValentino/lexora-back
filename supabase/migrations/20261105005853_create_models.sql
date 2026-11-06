CREATE TABLE public.models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) UNIQUE NOT NULL,
    summary TEXT NOT NULL,
    purpose TEXT NOT NULL,
    when_to_use TEXT,
    limitations TEXT,
    requirements TEXT,
    documentation TEXT,
    content_md TEXT NOT NULL,
    visibility VARCHAR(20) NOT NULL DEFAULT 'institution'
        CHECK (visibility IN ('institution', 'private')),
    category_id UUID REFERENCES public.categories(id),
    jurisdiction_id UUID REFERENCES public.jurisdictions(id),
    status VARCHAR(30) NOT NULL DEFAULT 'borrador'
        CHECK (status IN ('borrador', 'pendiente_revision', 'revisado', 'requiere_actualizacion')),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.users(id),
    created_by UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice GIN para búsqueda de texto completo en español
CREATE INDEX models_fts_idx
ON public.models
USING GIN (
    to_tsvector(
        'spanish',
        title || ' ' || summary || ' ' || purpose || ' ' || content_md
    )
);

-- Índice para filtrar por visibilidad y estado
CREATE INDEX models_visibility_status_idx
ON public.models(visibility, status);

-- Índices para las relaciones
CREATE INDEX models_category_id_idx
ON public.models(category_id);

CREATE INDEX models_jurisdiction_id_idx
ON public.models(jurisdiction_id);