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
  .validator((data) => editSectionSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { sectionTitle, currentContent, action, context: techContext } = data;
    
    // Simulate AI latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    let newContent = currentContent;
    
    switch (action) {
      case "improve":
        newContent = currentContent.replace(/^#+ (.*)/m, (match) => `${match}\n\nThis section has been enhanced for better clarity and impact.`);
        break;
      case "simplify":
        newContent = currentContent.split('\n').map(line => line.length > 60 ? line.substring(0, 60) + '...' : line).join('\n');
        break;
      case "professionalize":
        newContent = `### ${sectionTitle}\n\nThe following technical specifications and procedural guidelines are provided to ensure optimal integration and performance.\n\n${currentContent.replace(/### .*\n/, '')}`;
        break;
      case "fix_grammar":
        newContent = currentContent.replace(/dont/g, "don't").replace(/wont/g, "won't").replace(/its /g, "it's ");
        break;
      case "more_technical":
        const lang = techContext?.['language'] as any;
        if (lang?.value) {
          newContent = `${currentContent}\n\n*Technical Note: This module implements patterns specific to ${lang.value} development.*`;
        }
        break;
      case "beginner_friendly":
        newContent = `> **Note for beginners:** This section explains the basic concepts of ${sectionTitle.toLowerCase()}.\n\n${currentContent}`;
        break;
    }

    return {
      newContent,
      sectionTitle,
      timestamp: new Date().toISOString()
    };
  });
