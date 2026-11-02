CREATE TABLE public.case_members (
    case_id UUID NOT NULL
        REFERENCES public.cases(id) ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES public.users(id) ON DELETE CASCADE,

    member_role VARCHAR(20) NOT NULL
        CHECK (member_role IN ('owner', 'collaborator')),

    added_by UUID NOT NULL
        REFERENCES public.users(id),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (case_id, user_id)
);