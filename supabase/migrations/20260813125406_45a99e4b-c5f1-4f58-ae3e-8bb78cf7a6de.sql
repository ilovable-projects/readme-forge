DO $$ 
BEGIN 
    -- Fix repository_analyses
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='repository_analyses' AND column_name='existing_readme') THEN
        ALTER TABLE public.repository_analyses ADD COLUMN existing_readme text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='repository_analyses' AND column_name='updated_at') THEN
        ALTER TABLE public.repository_analyses ADD COLUMN updated_at timestamp with time zone default now();
    END IF;

    -- Fix readme_scores
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='readme_scores' AND column_name='project_structure_score') THEN
        ALTER TABLE public.readme_scores ADD COLUMN project_structure_score integer;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='readme_scores' AND column_name='testing_score') THEN
        ALTER TABLE public.readme_scores ADD COLUMN testing_score integer;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='readme_scores' AND column_name='deployment_score') THEN
        ALTER TABLE public.readme_scores ADD COLUMN deployment_score integer;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='readme_scores' AND column_name='license_score') THEN
        ALTER TABLE public.readme_scores ADD COLUMN license_score integer;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='readme_scores' AND column_name='warnings') THEN
        ALTER TABLE public.readme_scores ADD COLUMN warnings jsonb;
    END IF;

    -- Profiles constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_email_key') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
    END IF;
END $$;

-- Enable RLS (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repository_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readme_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readme_scores ENABLE ROW LEVEL SECURITY;

-- Grants (idempotent)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repositories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repository_analyses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.readme_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.readme_scores TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Policies
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
CREATE POLICY "Users can manage their own profile" ON public.profiles
    USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage their own repositories" ON public.repositories;
CREATE POLICY "Users can manage their own repositories" ON public.repositories
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own repository analyses" ON public.repository_analyses;
CREATE POLICY "Users can manage their own repository analyses" ON public.repository_analyses
    USING (EXISTS (SELECT 1 FROM public.repositories WHERE id = repository_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage their own readme documents" ON public.readme_documents;
CREATE POLICY "Users can manage their own readme documents" ON public.readme_documents
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own readme scores" ON public.readme_scores;
CREATE POLICY "Users can manage their own readme scores" ON public.readme_scores
    USING (EXISTS (SELECT 1 FROM public.readme_documents WHERE id = readme_document_id AND user_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_repositories_user_id ON public.repositories(user_id);
CREATE INDEX IF NOT EXISTS idx_readme_documents_user_id ON public.readme_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_repository_analyses_repository_id ON public.repository_analyses(repository_id);
CREATE INDEX IF NOT EXISTS idx_readme_scores_readme_document_id ON public.readme_scores(readme_document_id);
