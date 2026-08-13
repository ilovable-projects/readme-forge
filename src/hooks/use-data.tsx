import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeRepository } from "@/lib/github-analyzer.functions";
import { Session, User } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, user, loading, isAuthenticated: !!session };
}

export function useProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useRepositories() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['repositories', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('repositories')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateRepository() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (repo: any) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from('repositories')
        .insert([{ ...repo, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repositories', user?.id] });
    },
  });
}

export function useAnalyzeRepository() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const analyzeFn = useServerFn(analyzeRepository);

  return useMutation({
    mutationFn: async (githubUrl: string) => {
      if (!user) throw new Error("Not authenticated");
      
      // 1. Run the server-side analysis
      const result = await analyzeFn({ data: githubUrl });
      
      // 2. Save repository
      const { data: repo, error: repoError } = await supabase
        .from('repositories')
        .insert([{ ...result.repository, user_id: user.id }])
        .select()
        .single();
      
      if (repoError) throw repoError;

      // 3. Save analysis
      const { error: analysisError } = await supabase
        .from('repository_analyses')
        .insert([{ ...result.analysis, repository_id: repo.id }]);

      if (analysisError) throw analysisError;

      return repo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repositories', user?.id] });
    },
  });
}
