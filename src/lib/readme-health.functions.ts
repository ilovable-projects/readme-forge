import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { StructuredAnalysis } from "./github-analyzer.functions";

export interface CategoryResult {
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'missing';
  explanation: string;
  missing_information: string[];
  recommendation: string;
}

export interface Issue {
  level: 'critical' | 'warning' | 'suggestion';
  category: string;
  title: string;
  explanation: string;
  recommendation: string;
  sectionTitle?: string;
}

export interface HealthScoreResult {
  overall_score: number;
  categories: Record<string, CategoryResult>;
  issues: Issue[];
}

const scoreRequestSchema = z.object({
  documentId: z.string(),
  repositoryId: z.string(),
  content: z.string(),
});

export const calculateReadmeScore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => scoreRequestSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { documentId, repositoryId, content } = data;
    
    // 1. Fetch Analysis Context
    const { data: analysisData, error: analysisError } = await supabaseAdmin
      .from('repository_analyses')
      .select('*')
      .eq('repository_id', repositoryId)
      .maybeSingle();
      
    if (analysisError) throw analysisError;
    const analysis = (analysisData?.analysis_data || {}) as StructuredAnalysis;

    const issues: Issue[] = [];
    const categories: Record<string, CategoryResult> = {};
    
    // --- Helper for scoring ---
    const checkSection = (titles: string[]) => {
      const lowerContent = content.toLowerCase();
      return titles.some(t => lowerContent.includes(`## ${t.toLowerCase()}`) || lowerContent.includes(`### ${t.toLowerCase()}`));
    };

    // 1. Overview
    const hasOverview = checkSection(['overview', 'introduction', 'about']);
    categories['overview'] = {
      score: hasOverview ? 100 : 0,
      status: hasOverview ? 'excellent' : 'missing',
      explanation: hasOverview ? 'The project has a clear overview section.' : 'No overview or introduction found.',
      missing_information: hasOverview ? [] : ['Project purpose', 'High-level description'],
      recommendation: hasOverview ? 'Keep it concise.' : 'Add a ## Overview section explaining what this project does.'
    };
    if (!hasOverview) issues.push({ level: 'warning', category: 'Overview', title: 'Missing Overview', explanation: 'Users won\'t immediately understand the project purpose.', recommendation: 'Add an introductory section.', sectionTitle: 'Overview' });

    // 2. Features
    const hasFeatures = checkSection(['features', 'highlights', 'what it does']);
    categories['features'] = {
      score: hasFeatures ? 100 : 40,
      status: hasFeatures ? 'excellent' : 'fair',
      explanation: hasFeatures ? 'Key features are highlighted.' : 'Features are not explicitly listed.',
      missing_information: hasFeatures ? [] : ['Key functionalities', 'Unique selling points'],
      recommendation: 'List the main capabilities of your software in a bulleted list.'
    };
    if (!hasFeatures) issues.push({ level: 'suggestion', category: 'Features', title: 'Add Features list', explanation: 'A bulleted list of features helps users scan capabilities.', recommendation: 'Create a ## Features section.', sectionTitle: 'Features' });

    // 3. Installation
    const hasInstallation = checkSection(['installation', 'getting started', 'setup']);
    let installScore = hasInstallation ? 100 : 0;
    
    // Technical verification for Installation
    if (hasInstallation && analysis.packageManager?.value) {
      const pm = analysis.packageManager.value;
      const expectedCmd = pm === 'npm' ? 'npm install' : pm === 'yarn' ? 'yarn' : pm === 'pnpm' ? 'pnpm install' : 'bun install';
      if (!content.includes(expectedCmd)) {
        installScore = 60;
        issues.push({ 
          level: 'critical', 
          category: 'Installation', 
          title: 'Incorrect Installation Command', 
          explanation: `Project uses ${pm}, but the expected installation command (${expectedCmd}) was not found in the README.`, 
          recommendation: `Update installation steps to use ${expectedCmd}.`,
          sectionTitle: 'Installation'
        });
      }
    }

    categories['installation'] = {
      score: installScore,
      status: installScore === 100 ? 'excellent' : installScore > 0 ? 'poor' : 'missing',
      explanation: hasInstallation ? 'Installation steps are present.' : 'No installation guide found.',
      missing_information: hasInstallation ? [] : ['Dependencies', 'Step-by-step setup'],
      recommendation: 'Provide clear commands for users to get the project running locally.'
    };
    if (!hasInstallation) issues.push({ level: 'critical', category: 'Installation', title: 'Missing Installation Guide', explanation: 'Users cannot run your project without setup instructions.', recommendation: 'Add a ## Installation section.', sectionTitle: 'Installation' });

    // 4. Usage
    const hasUsage = checkSection(['usage', 'examples', 'how to use']);
    categories['usage'] = {
      score: hasUsage ? 100 : 30,
      status: hasUsage ? 'excellent' : 'poor',
      explanation: hasUsage ? 'Usage examples provided.' : 'No usage instructions found.',
      missing_information: hasUsage ? [] : ['Code examples', 'CLI usage', 'API reference'],
      recommendation: 'Add code blocks showing common use cases.'
    };
    if (!hasUsage) issues.push({ level: 'warning', category: 'Usage', title: 'Add Usage Examples', explanation: 'Users need to see how to actually use the tool after installing.', recommendation: 'Add a ## Usage section with examples.', sectionTitle: 'Usage' });

    // 5. Tech Stack
    const hasStack = checkSection(['tech stack', 'built with', 'technologies', 'stack']);
    categories['tech_stack'] = {
      score: hasStack ? 100 : 50,
      status: hasStack ? 'excellent' : 'fair',
      explanation: hasStack ? 'Technologies are listed.' : 'The tech stack is not clearly defined.',
      missing_information: hasStack ? [] : ['Core language', 'Frameworks', 'Databases'],
      recommendation: 'List the main technologies used in the project.'
    };

    // 6. Configuration (Env Vars)
    const hasConfig = checkSection(['configuration', 'environment variables', 'setup', 'config']);
    let configScore = hasConfig ? 100 : 100;
    if (analysis.envVars?.value?.length > 0 && !hasConfig) {
      configScore = 20;
      issues.push({ 
        level: 'warning', 
        category: 'Configuration', 
        title: 'Missing Environment Variables', 
        explanation: 'We detected required env vars in your repository analysis, but they aren\'t explained in the README.', 
        recommendation: 'Add a ## Configuration section listing required variables.',
        sectionTitle: 'Configuration'
      });
    }
    categories['configuration'] = {
      score: configScore,
      status: configScore === 100 ? 'excellent' : 'poor',
      explanation: configScore === 100 ? 'Configuration is well documented or not required.' : 'Missing environment variable documentation.',
      missing_information: configScore === 100 ? [] : ['Required .env keys', 'Default values'],
      recommendation: 'Document all required environment variables.'
    };

    // 7. Testing
    const hasTesting = checkSection(['testing', 'tests', 'running tests']);
    let testingScore = hasTesting ? 100 : 100;
    if (analysis.commands?.test?.value && !hasTesting) {
      testingScore = 40;
      issues.push({ 
        level: 'suggestion', 
        category: 'Testing', 
        title: 'Add Testing Instructions', 
        explanation: 'We found test scripts in your project. Documenting how to run them improves maintainability.', 
        recommendation: `Add a ## Testing section with "${analysis.commands.test.value}".`,
        sectionTitle: 'Testing'
      });
    }
    categories['testing'] = {
      score: testingScore,
      status: testingScore === 100 ? 'excellent' : 'fair',
      explanation: hasTesting ? 'Testing guide present.' : 'Testing instructions are missing.',
      missing_information: [],
      recommendation: 'Explain how to run the test suite.'
    };

    // 8. License
    const hasLicense = checkSection(['license']);
    categories['license'] = {
      score: hasLicense ? 100 : 0,
      status: hasLicense ? 'excellent' : 'missing',
      explanation: hasLicense ? 'License section is present.' : 'No license mentioned in README.',
      missing_information: ['License type'],
      recommendation: 'State the project license to clarify usage rights.'
    };
    if (!hasLicense) issues.push({ level: 'warning', category: 'License', title: 'Missing License Section', explanation: 'It\'s best practice to include the license name in the README.', recommendation: 'Add a ## License section.', sectionTitle: 'License' });

    // 9. Accuracy
    // Check if mentioned language/framework matches analysis
    let accuracyScore = 100;
    if (analysis.language?.value) {
      if (!content.toLowerCase().includes(analysis.language.value.toLowerCase())) {
        accuracyScore -= 20;
        issues.push({ 
          level: 'warning', 
          category: 'Accuracy', 
          title: 'Primary Language Not Mentioned', 
          explanation: `Project is primarily ${analysis.language.value}, but this isn't mentioned.`, 
          recommendation: 'Mention the core language in the Overview or Tech Stack.'
        });
      }
    }

    categories['accuracy'] = {
      score: accuracyScore,
      status: accuracyScore === 100 ? 'excellent' : 'fair',
      explanation: accuracyScore === 100 ? 'README reflects repository technical facts.' : 'Some technical discrepancies detected.',
      missing_information: [],
      recommendation: 'Ensure all technical commands and versions match the source code.'
    };

    // 10. Placeholder for others
    ['project_structure', 'deployment', 'contributing'].forEach(cat => {
      const hasCat = checkSection([cat.replace('_', ' ')]);
      categories[cat] = {
        score: hasCat ? 100 : 50,
        status: hasCat ? 'excellent' : 'fair',
        explanation: `${cat.replace('_', ' ')} information.`,
        missing_information: [],
        recommendation: `Consider expanding the ${cat.replace('_', ' ')} section.`
      };
    });

    // Calculate Overall Score
    const allScores = Object.values(categories).map(c => c.score);
    const overall_score = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

    const result: HealthScoreResult = {
      overall_score,
      categories,
      issues
    };

    // Persist result
    const { error: scoreError } = await supabaseAdmin
      .from('readme_scores')
      .upsert({
        readme_document_id: documentId,
        overall_score,
        overview_score: categories['overview'].score,
        features_score: categories['features'].score,
        installation_score: categories['installation'].score,
        usage_score: categories['usage'].score,
        tech_stack_score: categories['tech_stack'].score,
        project_structure_score: categories['project_structure'].score,
        testing_score: categories['testing'].score,
        accuracy_score: categories['accuracy'].score,
        issues: issues as any,
        metadata: {
          categories,
          calculated_at: new Date().toISOString()
        }
      }, { onConflict: 'readme_document_id' });

    if (scoreError) console.error("Failed to save score:", scoreError);

    return result;
  });
