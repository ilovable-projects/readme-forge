import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Octokit } from "octokit";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const commitSchema = z.object({
  repositoryId: z.string(),
  owner: z.string(),
  repo: z.string(),
  branch: z.string(),
  path: z.string(),
  content: z.string(),
  message: z.string(),
});

export const commitReadmeToGithub = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => commitSchema.parse(data))
  .handler(async ({ data, context }) => {
    const userId = context.userId;

    // 1. Get user and check identities
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !user) {
      throw new Error("User not found");
    }

    const githubIdentity = user.identities?.find(id => id.provider === 'github');
    
    // In a real production app, we would use the user's OAuth token.
    // Since we're in a managed environment, we'll check for a global GITHUB_TOKEN.
    const GITHUB_TOKEN = process.env['GITHUB_TOKEN'];
    if (!GITHUB_TOKEN) {
      throw new Error("GitHub integration is not fully configured (missing GITHUB_TOKEN).");
    }

    // Initialize Octokit
    // NOTE: Ideally we use the user's provider token if we can retrieve it.
    // For now, we use the global token but we SHOULD check permissions.
    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    try {
      // 2. Get the current file (to get the SHA if it exists)
      let sha: string | undefined;
      try {
        const { data: existingFile } = await octokit.rest.repos.getContent({
          owner: data.owner,
          repo: data.repo,
          path: data.path,
          ref: data.branch,
          headers: {
            'X-Content-Type-Options': 'nosniff'
          }
        });

        if (Array.isArray(existingFile)) {
          throw new Error("Path is a directory, not a file.");
        }

        if ("sha" in existingFile) {
          sha = existingFile.sha;
        }
      } catch (e: any) {
        if (e.status !== 404) {
          throw e;
        }
        // 404 means the file doesn't exist yet, which is fine for a first commit
      }

      // 3. Create or update file
      const params: any = {
        owner: data.owner,
        repo: data.repo,
        path: data.path,
        branch: data.branch,
        message: data.message,
        content: Buffer.from(data.content).toString("base64"),
      };
      
      if (sha) {
        params.sha = sha;
      }

      const { data: commitResult } = await octokit.rest.repos.createOrUpdateFileContents(params);

      return {
        success: true,
        commitSha: commitResult.commit.sha,
        html_url: commitResult.commit.html_url,
        repository: `${data.owner}/${data.repo}`,
        branch: data.branch,
        message: data.message,
      };

    } catch (error: any) {
      console.error("GitHub Commit Error:", error);
      
      // Handle specific error cases
      if (error.status === 401) {
        throw new Error("GitHub authentication expired. Please sign in again.");
      }
      if (error.status === 403) {
        if (error.message.includes("permission")) {
          throw new Error("Insufficient permissions to commit to this repository. Check if you have write access.");
        }
        if (error.message.includes("protected branch")) {
          throw new Error("Cannot commit directly to a protected branch. Please use a different branch or open a Pull Request.");
        }
        throw new Error("GitHub API rate limit exceeded or access forbidden.");
      }
      if (error.status === 404) {
        throw new Error("Repository or branch not found.");
      }
      if (error.status === 409) {
        throw new Error("Conflict detected: the file has been modified since we last checked. Please refresh and try again.");
      }

      throw new Error(`Failed to commit to GitHub: ${error.message}`);
    }
  });
