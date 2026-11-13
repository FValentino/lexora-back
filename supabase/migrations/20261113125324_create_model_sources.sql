CREATE TABLE public.model_sources (
    model_id UUID NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (model_id, source_id)
);