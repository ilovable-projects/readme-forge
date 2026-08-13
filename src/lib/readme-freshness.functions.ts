import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { StructuredAnalysis } from "./github-analyzer.functions";

export interface FreshnessDifference {
  type: 'dependency' | 'framework' | 'script' | 'envVar' | 'license' | 'command' | 'structure';
  label: string;
  readmeValue: string | string[] | null;
  repoValue: string | string[] | null;
  severity: 'info' | 'warning' | 'critical';
}

export interface FreshnessStatus {
  isUpToDate: boolean;
  differences: FreshnessDifference[];
  lastCheckedAt: string;
}

export const checkReadmeFreshness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { repositoryId: string; documentId: string }) => z.object({
    repositoryId: z.string(),
    documentId: z.string(),
  }).parse(data))
  .handler(async ({ data: { repositoryId, documentId } }) => {
    // 1. Fetch current analysis and current README
    const { data: analysis, error: analysisError } = await supabaseAdmin
      .from('repository_analyses')
      .select('*')
      .eq('repository_id', repositoryId)
      .maybeSingle();

    if (analysisError || !analysis) {
      throw new Error("Repository analysis not found");
    }

    const { data: document, error: docError } = await supabaseAdmin
      .from('readme_documents')
      .select('*')
      .eq('id', documentId)
      .maybeSingle();

    if (docError || !document) {
      throw new Error("README document not found");
    }

    const structuredAnalysis = analysis.analysis_data as unknown as StructuredAnalysis;
    const markdown = document.markdown_content || "";
    const differences: FreshnessDifference[] = [];

    // Helper to check if a value is present in markdown
    const inMarkdown = (val: string | null) => {
      if (!val) return true;
      return markdown.toLowerCase().includes(val.toLowerCase());
    };

    // 2. Compare Frameworks
    const repoFrameworks = structuredAnalysis.frameworks.value;
    repoFrameworks.forEach(fw => {
      if (!inMarkdown(fw)) {
        differences.push({
          type: 'framework',
          label: `Framework: ${fw}`,
          readmeValue: 'Missing',
          repoValue: fw,
          severity: 'critical'
        });
      }
    });

    // 3. Compare Dependencies (Top level / key ones)
    const keyDeps = ['tailwindcss', 'typescript', 'vite', 'next', 'react', 'prisma', 'supabase', 'drizzle'];
    const repoDeps = analysis.detected_dependencies as Record<string, string> || {};
    keyDeps.forEach(dep => {
      if (repoDeps[dep] && !inMarkdown(dep)) {
        differences.push({
          type: 'dependency',
          label: `Key Dependency: ${dep}`,
          readmeValue: 'Missing',
          repoValue: dep,
          severity: 'warning'
        });
      }
    });

    // 4. Compare Scripts/Commands
    const commands = structuredAnalysis.commands;
    if (commands.development.value && !inMarkdown(commands.development.value)) {
      differences.push({
        type: 'command',
        label: 'Development Command',
        readmeValue: 'Different or missing',
        repoValue: commands.development.value,
        severity: 'warning'
      });
    }
    if (commands.build.value && !inMarkdown(commands.build.value)) {
      differences.push({
        type: 'command',
        label: 'Build Command',
        readmeValue: 'Different or missing',
        repoValue: commands.build.value,
        severity: 'info'
      });
    }

    // 5. Compare Env Vars
    const repoEnvVars = structuredAnalysis.envVars.value;
    repoEnvVars.forEach(v => {
      if (!inMarkdown(v)) {
        differences.push({
          type: 'envVar',
          label: `Env Var: ${v}`,
          readmeValue: 'Missing',
          repoValue: v,
          severity: 'warning'
        });
      }
    });

    // 6. Compare License
    const repoLicense = structuredAnalysis.license.value;
    if (repoLicense && !inMarkdown(repoLicense)) {
      differences.push({
        type: 'license',
        label: 'License',
        readmeValue: 'Outdated or missing',
        repoValue: repoLicense,
        severity: 'critical'
      });
    }

    return {
      isUpToDate: differences.length === 0,
      differences,
      lastCheckedAt: new Date().toISOString()
    };
  });
