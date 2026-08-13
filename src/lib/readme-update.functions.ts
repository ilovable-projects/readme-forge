import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const updateReadmeSchema = z.object({
  documentId: z.string(),
  repositoryId: z.string(),
  currentContent: z.string(),
  differences: z.array(z.any()),
});

export const updateReadmeWithAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => updateReadmeSchema.parse(data))
  .handler(async ({ data }) => {
    const { currentContent, differences } = data;
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    let updatedContent = currentContent;

    // Apply "smart" updates based on differences
    for (const diff of differences) {
      if (diff.type === 'framework' || diff.type === 'dependency') {
        // Try to inject into Tech Stack or Overview
        if (updatedContent.includes('## Tech Stack')) {
          updatedContent = updatedContent.replace('## Tech Stack', `## Tech Stack\n- ${diff.repoValue} (Updated)`);
        } else if (updatedContent.includes('## Features')) {
          updatedContent = updatedContent.replace('## Features', `## Features\n- Built with ${diff.repoValue}`);
        }
      } else if (diff.type === 'command') {
        // Try to update Installation or Usage
        if (updatedContent.includes('```')) {
          // This is a naive replacement for demonstration, in real AI it would be more precise
          updatedContent = updatedContent + `\n\n### Updated Command\n\`\`\`bash\n${diff.repoValue}\n\`\`\``;
        }
      } else if (diff.type === 'envVar') {
        if (updatedContent.includes('## Configuration')) {
          updatedContent = updatedContent.replace('## Configuration', `## Configuration\n- \`${diff.repoValue}\` (Required)`);
        }
      } else if (diff.type === 'license') {
        if (updatedContent.includes('## License')) {
          updatedContent = updatedContent.replace(/## License\n.*/, `## License\nThis project is licensed under the ${diff.repoValue} License.`);
        }
      }
    }

    return {
      updatedContent,
      originalContent: currentContent,
      timestamp: new Date().toISOString()
    };
  });
