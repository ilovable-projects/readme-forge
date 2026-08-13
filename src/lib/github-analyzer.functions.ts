import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Octokit } from "octokit";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Confidence = 'verified' | 'likely' | 'unknown';

export interface AnalysisEntry<T> {
  value: T;
  confidence: Confidence;
  source?: string;
}

export interface StructuredAnalysis {
  language: AnalysisEntry<string | null>;
  frameworks: AnalysisEntry<string[]>;
  packageManager: AnalysisEntry<string | null>;
  commands: {
    development: AnalysisEntry<string | null>;
    build: AnalysisEntry<string | null>;
    test: AnalysisEntry<string | null>;
    start: AnalysisEntry<string | null>;
  };
  envVars: AnalysisEntry<string[]>;
  license: AnalysisEntry<string | null>;
  documentationStatus: {
    readme: boolean;
    contributing: boolean;
    license: boolean;
  };
  fileCount: number;
}

const githubUrlSchema = z.string().url().refine((url) => {
  return url.startsWith("https://github.com/") && url.split("/").filter(Boolean).length >= 3;
}, "Invalid GitHub repository URL");

export const analyzeRepository = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.string().url().parse(data))
  .handler(async ({ data: repoUrl, context }) => {
    const userId = context.userId;
    if (!repoUrl) throw new Error("URL is required");

    const GITHUB_TOKEN = process.env['GITHUB_TOKEN'];
    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    const cleanUrl = (repoUrl || "").split('?')[0].split('#')[0].replace(/\/$/, "");
    const parts = cleanUrl.replace("https://github.com/", "").split("/").filter(Boolean);
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
            headers: {
              'X-Content-Type-Options': 'nosniff'
            }
          });

          if ("content" in content) {
            detectedConfigs[file] = Buffer.from(content.content, "base64").toString("utf-8");
          }
        } catch (e) {
          console.error(`Failed to fetch ${file}:`, e);
        }
      }

      // 4. Extract Technologies & Metadata (Normalized Structured Analysis)
      const structuredAnalysis: StructuredAnalysis = {
        language: { 
          value: repository.language || null, 
          confidence: repository.language ? 'verified' : 'unknown',
          source: 'GitHub Metadata'
        },
        frameworks: { value: [], confidence: 'unknown' },
        packageManager: { value: null, confidence: 'unknown' },
        commands: {
          development: { value: null, confidence: 'unknown' },
          build: { value: null, confidence: 'unknown' },
          test: { value: null, confidence: 'unknown' },
          start: { value: null, confidence: 'unknown' },
        },
        envVars: { value: [], confidence: 'unknown' },
        license: { 
          value: repository.license?.name || null, 
          confidence: repository.license ? 'verified' : 'unknown',
          source: 'GitHub Metadata'
        },
        documentationStatus: {
          readme: files.some(f => f.toLowerCase() === 'readme.md'),
          contributing: files.some(f => f.toLowerCase() === 'contributing.md'),
          license: !!repository.license || files.some(f => f.toLowerCase() === 'license'),
        },
        fileCount: files.length,
      };

      const techContext = {
        dependencies: {} as Record<string, string>,
        scripts: {} as Record<string, string>,
      };

      // Detect Package Manager
      if (files.includes('package-lock.json')) {
        structuredAnalysis.packageManager = { value: 'npm', confidence: 'verified', source: 'package-lock.json' };
      } else if (files.includes('yarn.lock')) {
        structuredAnalysis.packageManager = { value: 'yarn', confidence: 'verified', source: 'yarn.lock' };
      } else if (files.includes('pnpm-lock.yaml')) {
        structuredAnalysis.packageManager = { value: 'pnpm', confidence: 'verified', source: 'pnpm-lock.yaml' };
      } else if (files.includes('bun.lockb')) {
        structuredAnalysis.packageManager = { value: 'bun', confidence: 'verified', source: 'bun.lockb' };
      }

      // Parse package.json
      const packageJsonPath = foundConfigFiles.find(f => f.endsWith("package.json"));
      if (packageJsonPath && detectedConfigs[packageJsonPath]) {
        try {
          const pkg = JSON.parse(detectedConfigs[packageJsonPath]);
          techContext.dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
          techContext.scripts = pkg.scripts || {};
          
          // Framework detection
          const frameworks: string[] = [];
          if (techContext.dependencies["react"]) frameworks.push("React");
          if (techContext.dependencies["next"]) frameworks.push("Next.js");
          if (techContext.dependencies["vue"]) frameworks.push("Vue");
          if (techContext.dependencies["svelte"]) frameworks.push("Svelte");
          if (techContext.dependencies["tailwindcss"]) frameworks.push("Tailwind CSS");
          
          if (frameworks.length > 0) {
            structuredAnalysis.frameworks = { value: frameworks, confidence: 'verified', source: 'package.json' };
          }

          // Command detection
          const pm = structuredAnalysis.packageManager.value || 'npm';
          if (techContext.scripts['dev']) {
            structuredAnalysis.commands.development = { value: `${pm} run dev`, confidence: 'verified', source: 'package.json' };
          }
          if (techContext.scripts['build']) {
            structuredAnalysis.commands.build = { value: `${pm} run build`, confidence: 'verified', source: 'package.json' };
          }
          if (techContext.scripts['test']) {
            structuredAnalysis.commands.test = { value: `${pm} test`, confidence: 'verified', source: 'package.json' };
          }
          if (techContext.scripts['start']) {
            structuredAnalysis.commands.start = { value: `${pm} start`, confidence: 'verified', source: 'package.json' };
          }
        } catch (e) {
          console.error("Failed to parse package.json");
        }
      }

      // Extract safe env var names
      const envExamplePath = foundConfigFiles.find(f => f.endsWith(".env.example"));
      if (envExamplePath && detectedConfigs[envExamplePath]) {
        const lines = detectedConfigs[envExamplePath].split("\n");
        const vars = lines
          .map(line => {
            const parts = line.split("=");
            return parts[0] ? parts[0].trim() : "";
          })
          .filter(name => name && !name.startsWith("#"));
        
        if (vars.length > 0) {
          structuredAnalysis.envVars = { value: vars, confidence: 'verified', source: '.env.example' };
        }
      } else if (files.includes('.env')) {
        // We don't read .env but we know they are likely used
        structuredAnalysis.envVars.confidence = 'likely';
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
          detected_languages: structuredAnalysis.language.value ? [structuredAnalysis.language.value] : [],
          detected_frameworks: structuredAnalysis.frameworks.value,
          detected_dependencies: techContext.dependencies,
          detected_scripts: techContext.scripts,
          project_structure: projectStructure,
          environment_variables: structuredAnalysis.envVars.value,
          license: structuredAnalysis.license.value,
          existing_readme: readmePath ? (detectedConfigs[readmePath] || null) : null,
          analysis_data: structuredAnalysis as any
        }
      };

      // 5. Persist to database
      const { data: repoData, error: repoError } = await supabaseAdmin
        .from('repositories')
        .insert([{
          github_url: `https://github.com/${owner}/${repo}`,
          owner: result.repository.owner,
          name: result.repository.name,
          description: result.repository.description?.substring(0, 1000) || null,
          default_branch: result.repository.default_branch,
          language: result.repository.language,
          stars: result.repository.stars,
          forks: result.repository.forks,
          is_private: result.repository.is_private,
          metadata: result.repository.metadata as any,
          user_id: userId
        }])
        .select()
        .single();
      
      if (repoError || !repoData) throw repoError || new Error("Failed to create repository");
      
      const { error: analysisError } = await supabaseAdmin
        .from('repository_analyses')
        .insert([{
          repository_id: repoData.id,
          detected_languages: result.analysis.detected_languages as any,
          detected_frameworks: result.analysis.detected_frameworks as any,
          detected_dependencies: result.analysis.detected_dependencies as any,
          detected_scripts: result.analysis.detected_scripts as any,
          project_structure: result.analysis.project_structure as any,
          environment_variables: result.analysis.environment_variables as any,
          license: result.analysis.license,
          existing_readme: result.analysis.existing_readme,
          analysis_data: result.analysis.analysis_data as any
        }]);

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
