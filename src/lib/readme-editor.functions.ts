import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const editSectionSchema = z.object({
  documentId: z.string(),
  sectionTitle: z.string(),
  currentContent: z.string(),
  action: z.enum([
    "improve",
    "simplify",
    "professionalize",
    "fix_grammar",
    "more_technical",
    "beginner_friendly"
  ]),
  context: z.record(z.any()).optional(),
});

export const editReadmeSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => editSectionSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { documentId, sectionTitle, currentContent, action, context: techContext } = data;
    const userId = context.userId;

    // In a real implementation, this would call an AI model (e.g., OpenAI, Anthropic via Lovable AI Gateway)
    // For now, we simulate the AI transformation while preserving factual accuracy as requested.
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI latency

    let newContent = currentContent;
    const prompt = `Action: ${action} on section "${sectionTitle}"`;
    
    // Mock transformations that maintain structure but change tone/style
    switch (action) {
      case "improve":
        newContent = currentContent.replace(/^#+ (.*)/m, (match) => `${match}\n\nThis section has been enhanced for better clarity and impact.`);
        break;
      case "simplify":
        newContent = currentContent.split('\n').map(line => line.length > 50 ? line.substring(0, 50) + '...' : line).join('\n');
        break;
      case "professionalize":
        newContent = `### ${sectionTitle}\n\nThe following technical specifications and procedural guidelines are provided to ensure optimal integration and performance.\n\n${currentContent}`;
        break;
      case "fix_grammar":
        newContent = currentContent.replace(/dont/g, "don't").replace(/wont/g, "won't"); // Simple mock fix
        break;
      case "more_technical":
        if (techContext?.language?.value) {
          newContent = `${currentContent}\n\n*Implementation Details: Developed using ${techContext.language.value} architectural patterns.*`;
        }
        break;
      case "beginner_friendly":
        newContent = `> **Note for beginners:** This section explains the basic concepts.\n\n${currentContent}`;
        break;
    }

    return {
      newContent,
      sectionTitle,
      timestamp: new Date().toISOString()
    };
  });
