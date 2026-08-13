import { createServerFn } from "@tanstack/react-start";
import { Octokit } from "octokit";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export const fetchUserRepositories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;

    // Get user's provider token from Supabase Auth
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !user) {
      throw new Error("User not found");
    }

    // Public repositories only: a token is optional (used purely to raise rate limits).
    const rawToken = process.env['GITHUB_TOKEN'];
    const GITHUB_TOKEN = (rawToken && rawToken !== "undefined" && rawToken !== "null" && rawToken.length > 5) ? rawToken : undefined;
    
    // Rate limiting: simple in-memory check for demo purposes
    // In production, use Redis or a database-backed rate limiter
    const octokit = GITHUB_TOKEN ? new Octokit({ auth: GITHUB_TOKEN }) : new Octokit();

    // For V1, we might only be able to fetch public repos if we don't have the user's specific OAuth token
    // If the user's GitHub username is known, we can fetch their public repos
    const githubIdentity = user.identities?.find(id => id.provider === 'github');
    
    if (!githubIdentity) {
      // If no GitHub identity, we can't fetch "user's" repos specifically without a token/username
      // But we can try to list public repos if we have a username in metadata
      const username = (user.user_metadata as any)?.user_name || (user.user_metadata as any)?.full_name;
      if (!username) {
        return [];
      }
      
      const { data } = await octokit.rest.repos.listForUser({
        username,
        sort: 'updated',
        per_page: 100
      });
      return data as GitHubRepository[];
    }

    // If we have a github identity, we can use the provider_id or fetch by username
    const username = (githubIdentity.identity_data as any)?.user_name || (user.user_metadata as any)?.user_name;
    
    if (!username) {
      return [];
    }

    try {
      const { data } = await octokit.rest.repos.listForUser({
        username,
        sort: 'updated',
        per_page: 100
      });
      return data as GitHubRepository[];
    } catch (error: any) {
      console.error("Error fetching GitHub repos:", error);
      return [];
    }
  });