-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create repositories table
CREATE TABLE public.repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    github_url TEXT NOT NULL,
    owner TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    default_branch TEXT DEFAULT 'main',
    language TEXT,
    stars INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    is_private BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create readme_documents table
CREATE TABLE public.readme_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    repository_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    markdown_content TEXT NOT NULL,
    template TEXT,
    score INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create repository_analyses table
CREATE TABLE public.repository_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE NOT NULL,
    analysis_data JSONB DEFAULT '{}'::jsonb NOT NULL,
    detected_languages JSONB DEFAULT '[]'::jsonb,
    detected_frameworks JSONB DEFAULT '[]'::jsonb,
    detected_dependencies JSONB DEFAULT '[]'::jsonb,
    detected_scripts JSONB DEFAULT '{}'::jsonb,
    project_structure JSONB DEFAULT '[]'::jsonb,
    environment_variables JSONB DEFAULT '[]'::jsonb,
    license TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create readme_scores table
CREATE TABLE public.readme_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    readme_document_id UUID REFERENCES public.readme_documents(id) ON DELETE CASCADE NOT NULL,
    overall_score INTEGER NOT NULL,
    overview_score INTEGER,
    installation_score INTEGER,
    usage_score INTEGER,
    features_score INTEGER,
    tech_stack_score INTEGER,
    configuration_score INTEGER,
    contribution_score INTEGER,
    documentation_score INTEGER,
    accuracy_score INTEGER,
    issues JSONB DEFAULT '[]'::jsonb,
    suggestions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readme_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repository_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readme_scores ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.repositories TO authenticated;
GRANT ALL ON public.repositories TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.readme_documents TO authenticated;
GRANT ALL ON public.readme_documents TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.repository_analyses TO authenticated;
GRANT ALL ON public.repository_analyses TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.readme_scores TO authenticated;
GRANT ALL ON public.readme_scores TO service_role;

-- Policies

-- Profiles: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Repositories: Users can only see and manage their own repositories
CREATE POLICY "Users can view own repositories" ON public.repositories
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own repositories" ON public.repositories
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Readme Documents: Users can only see and manage their own readme documents
CREATE POLICY "Users can view own readme_documents" ON public.readme_documents
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own readme_documents" ON public.readme_documents
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Repository Analyses: Users can only see analyses for their own repositories
CREATE POLICY "Users can view own repository_analyses" ON public.repository_analyses
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.repositories
            WHERE public.repositories.id = public.repository_analyses.repository_id
            AND public.repositories.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert analyses for own repositories" ON public.repository_analyses
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.repositories
            WHERE public.repositories.id = public.repository_analyses.repository_id
            AND public.repositories.user_id = auth.uid()
        )
    );

-- Readme Scores: Users can only see scores for their own readme documents
CREATE POLICY "Users can view own readme_scores" ON public.readme_scores
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.readme_documents
            WHERE public.readme_documents.id = public.readme_scores.readme_document_id
            AND public.readme_documents.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert scores for own readme_documents" ON public.readme_scores
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.readme_documents
            WHERE public.readme_documents.id = public.readme_scores.readme_document_id
            AND public.readme_documents.user_id = auth.uid()
        )
    );

-- Indexes for performance
CREATE INDEX idx_repositories_user_id ON public.repositories(user_id);
CREATE INDEX idx_readme_documents_user_id ON public.readme_documents(user_id);
CREATE INDEX idx_readme_documents_repository_id ON public.readme_documents(repository_id);
CREATE INDEX idx_repository_analyses_repository_id ON public.repository_analyses(repository_id);
CREATE INDEX idx_readme_scores_readme_document_id ON public.readme_scores(readme_document_id);
