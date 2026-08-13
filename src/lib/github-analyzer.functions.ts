import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Octokit } from "octokit";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const githubUrlSchema = z.string().url().refine((url) => {
  return url.startsWith("https://github.com/") && url.split("/").filter(Boolean).length >= 3;
}, "Invalid GitHub repository URL");

export const analyzeRepository = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => githubUrlSchema.parse(data))
  .handler(async ({ data: repoUrl, context }) => {
    const userId = context.userId;

    const GITHUB_TOKEN = process.env['GITHUB_TOKEN'];
    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    const parts = repoUrl.replace("https://github.com/", "").split("/").filter(Boolean);
    const owner = parts[0];
    const repo = parts[1];

    if (!owner || !repo) {
      throw new Error("Invalid GitHub repository URL format.");
    }

    try {
      // 1. Fetch Repository Metadata
      const { data: repository } = await octokit.rest.repos.get({
        owner,
        repo,
      });

      if (repository.private) {
        throw new Error("Only public repositories are supported for V1.");
      }

      // 2. Scan File Structure (Top level + key directories)
      const { data: tree } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: repository.default_branch || 'main',
        recursive: "1",
      });

      const files = tree.tree.filter((node) => node.type === "blob").map((node) => node.path || "");
      const projectStructure = tree.tree
        .filter((node) => node.path && (node.path.split("/").length <= 2 || ["src", "app", "public", ".github"].some(d => node.path?.startsWith(d))))
        .map((node) => ({
          path: node.path,
          type: node.type,
        }));

      // 3. Analyze Configuration Files
      const configFiles = [
        "package.json",
        "package-lock.json",
        "pnpm-lock.yaml",
        "yarn.lock",
        "requirements.txt",
        "pyproject.toml",
        "Pipfile",
        "Cargo.toml",
        "go.mod",
        "pom.xml",
        "build.gradle",
        "composer.json",
        "Gemfile",
        "Dockerfile",
        "docker-compose.yml",
        ".env.example",
        "LICENSE",
        "README.md",
      ];

      const detectedConfigs: Record<string, string> = {};
      const foundConfigFiles = files.filter((f) => configFiles.includes(f) || configFiles.some(cf => f.endsWith('/' + cf)));

      for (const file of foundConfigFiles) {
        // Only fetch small config files to avoid payload limits
        try {
          const { data: content } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: file,
          });

          if ("content" in content) {
            detectedConfigs[file] = Buffer.from(content.content, "base64").toString("utf-8");
          }
        } catch (e) {
          console.error(`Failed to fetch ${file}:`, e);
        }
      }

      // 4. Extract Technologies & Metadata
      const technologies = {
        languages: repository.language ? [repository.language] : [],
        frameworks: [] as string[],
        dependencies: {} as Record<string, string>,
        scripts: {} as Record<string, string>,
        env_vars: [] as string[],
        license: repository.license?.name || null,
      };

      // Simple parsing of package.json if present
      const packageJsonPath = foundConfigFiles.find(f => f.endsWith("package.json"));
      if (packageJsonPath && detectedConfigs[packageJsonPath]) {
        try {
          const pkg = JSON.parse(detectedConfigs[packageJsonPath]);
          technologies.dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
          technologies.scripts = pkg.scripts || {};
          
          if (technologies.dependencies["react"]) technologies.frameworks.push("React");
          if (technologies.dependencies["next"]) technologies.frameworks.push("Next.js");
          if (technologies.dependencies["vue"]) technologies.frameworks.push("Vue");
          if (technologies.dependencies["@tailwindcss/postcss"] || technologies.dependencies["tailwindcss"]) technologies.frameworks.push("Tailwind CSS");
        } catch (e) {
          console.error("Failed to parse package.json");
        }
      }

      // Extract safe env var names from .env.example
      const envExamplePath = foundConfigFiles.find(f => f.endsWith(".env.example"));
      if (envExamplePath) {
        const content = envExamplePath ? detectedConfigs[envExamplePath] : undefined;
        if (content) {
          const lines = content.split("\n");
          technologies.env_vars = lines
            .map(line => {
              const parts = line.split("=");
              return parts[0] ? parts[0].trim() : "";
            })
            .filter(name => name && !name.startsWith("#"));
        }
      }

      const readmePath = foundConfigFiles.find(f => f.toLowerCase().endsWith("readme.md"));

      const result = {
        repository: {
          github_url: repoUrl,
          owner: repository.owner.login,
          name: repository.name,
          description: repository.description,
          default_branch: repository.default_branch,
          language: repository.language,
          stars: repository.stargazers_count,
          forks: repository.forks_count,
          is_private: repository.private,
          metadata: { 
            analyzed: true,
            topics: repository.topics || [],
          }
        },
        analysis: {
          detected_languages: technologies.languages,
          detected_frameworks: technologies.frameworks,
          detected_dependencies: technologies.dependencies,
          detected_scripts: technologies.scripts,
          project_structure: projectStructure,
          environment_variables: technologies.env_vars,
          license: technologies.license,
          existing_readme: readmePath ? (detectedConfigs[readmePath] || null) : null,
          analysis_data: {
            file_count: files.length,
            full_tree: files.slice(0, 100),
          }
        }
      };

      // 5. Persist to database server-side for security and atomicity
      const { data: repoData, error: repoError } = await supabaseAdmin
        .from('repositories')
        .insert([{ ...result.repository, user_id: userId }])
        .select()
        .single();
      
      if (repoError || !repoData) throw repoError || new Error("Failed to create repository");
      
      const { error: analysisError } = await supabaseAdmin
        .from('repository_analyses')
        .insert([{ ...result.analysis, repository_id: repoData.id }]);

      if (analysisError) throw analysisError;

      return repoData;
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error("Repository not found or is private.");
      }
      if (error.status === 403) {
        throw new Error("GitHub API rate limit exceeded. Please try again later.");
      }
      throw new Error(`Analysis failed: ${error.message}`);
    }
  });
