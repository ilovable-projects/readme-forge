import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { 
  FileText, 
  Eye, 
  Sparkles, 
  Download, 
  Copy, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle,
  Save,
  ArrowLeft,
  ChevronRight,
  Maximize2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-data";
import { toast } from "sonner";
import { z } from "zod";

const editorSearchSchema = z.object({
  repositoryId: z.string().optional(),
});

export const Route = createFileRoute("/editor/")({
  validateSearch: (search) => editorSearchSchema.parse(search),
  component: EditorPage,
});

const SECTIONS = [
  "Overview", "Features", "Installation", "Usage", "Tech Stack", 
  "Configuration", "Project Structure", "Screenshots", "Testing", 
  "Deployment", "Contributing", "License"
];

const MOCK_MARKDOWN = `# Project Title

Enter your repository URL to generate a custom README.
`;

function EditorPage() {
  const { repositoryId } = useSearch({ from: '/editor/' });
  const { user } = useAuth();
  const [markdown, setMarkdown] = useState(MOCK_MARKDOWN);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!repositoryId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    if (repositoryId && user) {
      loadDocument();
    }
  }, [repositoryId, user]);

  const loadDocument = async () => {
    setIsLoading(true);
    try {
      // Load analysis first to have context
      const { data: analysisData } = await supabase
        .from('repository_analyses')
        .select('*')
        .eq('repository_id', repositoryId!)
        .maybeSingle();
      
      if (analysisData) setAnalysis(analysisData);

      const { data, error } = await supabase
        .from('readme_documents')
        .select('*')
        .eq('repository_id', repositoryId!)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setMarkdown(data.markdown_content);
        setDocumentId(data.id);
      } else if (analysisData) {
        // If no document exists, suggest generating one
        setMarkdown(`# ${analysisData.repository_id}\n\nAnalyzing your repository... click "Generate with AI" to create your first README.`);
      }
    } catch (error: any) {
      toast.error("Failed to load document: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!analysis) {
      toast.error("No repository analysis found. Please re-analyze the repository.");
      return;
    }

    setIsGenerating(true);
    try {
      const data = analysis.analysis_data;
      // If analysis_data doesn't have the new structure yet, fallback to basic detection
      const techStack = data.frameworks 
        ? [...data.frameworks.value, data.language.value].filter(Boolean).join(", ")
        : [...(analysis.detected_frameworks || []), ...(analysis.detected_languages || [])].join(", ");
      
      let content = `# ${analysis.repository_id || 'Project'}\n\n`;
      content += `## Overview\nA modern project built with ${techStack}.\n\n`;
      
      if (data.frameworks?.value.length) {
        content += `## Tech Stack\n${data.frameworks.value.map((f: string) => `- ${f}`).join('\n')}\n\n`;
      } else if (analysis.detected_frameworks?.length) {
        content += `## Tech Stack\n${analysis.detected_frameworks.map((f: string) => `- ${f}`).join('\n')}\n\n`;
      }

      if (data.commands) {
        content += `## Getting Started\n\n`;
        if (data.packageManager?.value) {
          content += `This project uses **${data.packageManager.value}** as its package manager.\n\n`;
        }
        
        content += `### Commands\n\n`;
        if (data.commands.development?.value) content += `- **Development**: \`${data.commands.development.value}\`\n`;
        if (data.commands.build?.value) content += `- **Build**: \`${data.commands.build.value}\`\n`;
        if (data.commands.test?.value) content += `- **Test**: \`${data.commands.test.value}\`\n`;
        if (data.commands.start?.value) content += `- **Start**: \`${data.commands.start.value}\`\n`;
        content += `\n`;
      }

      const envVars = data.envVars?.value || analysis.environment_variables;
      if (envVars?.length) {
        content += `## Environment Variables\nTo run this project, you will need to add the following environment variables to your .env file:\n\n${envVars.map((v: string) => `- \`${v}\``).join('\n')}\n\n`;
      }

      const license = data.license?.value || analysis.license;
      if (license) {
        content += `## License\nThis project is licensed under the ${license} License.\n`;
      }

      setMarkdown(content);
      toast.success("README generated based on repository analysis!");
    } catch (error: any) {
      toast.error("Generation failed: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user || !repositoryId) {
      toast.error("You must be logged in and have a repository selected to save.");
      return;
    }

    setIsSaving(true);
    try {
      if (documentId) {
        const { error } = await supabase
          .from('readme_documents')
          .update({ markdown_content: markdown, updated_at: new Date().toISOString() })
          .eq('id', documentId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('readme_documents')
          .insert([{
            user_id: user.id,
            repository_id: repositoryId,
            title: 'README.md',
            markdown_content: markdown
          }])
          .select()
          .single();
        if (error) throw error;
        setDocumentId(data.id);
      }
      toast.success("Changes saved successfully!");
    } catch (error: any) {
      toast.error("Failed to save: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading README...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {/* Editor Header */}
      <header className="flex h-14 items-center justify-between border-b border-border/40 bg-card/30 px-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold">README.md</span>
            <Badge variant="secondary" className="ml-2 text-[10px] uppercase tracking-tighter">Draft</Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            navigator.clipboard.writeText(markdown);
            toast.success("Markdown copied to clipboard!");
          }}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const blob = new Blob([markdown], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'README.md';
            a.click();
            URL.revokeObjectURL(url);
          }}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </header>

      {/* Editor Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Section Navigation (Sidebar) */}
        <aside className="w-56 border-r border-border/40 bg-card/20 overflow-y-auto hidden md:block">
          <div className="p-4">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Sections</h3>
            <div className="space-y-1">
              {SECTIONS.map((section) => (
                <button 
                  key={section}
                  className="flex w-full items-center justify-between px-2 py-1.5 text-sm rounded-md hover:bg-secondary/50 transition-colors text-left"
                >
                  <span className="text-muted-foreground">{section}</span>
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                </button>
              ))}
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
               <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">AI Actions</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start text-xs border-primary/20 bg-primary/5 text-primary"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                    >
                      {isGenerating ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Sparkles className="mr-2 h-3 w-3" />}
                      Generate with AI
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      <RefreshCcw className="mr-2 h-3 w-3" />
                      Regenerate
                    </Button>
                  </div>
               </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex flex-1 overflow-hidden">
          <Tabs defaultValue="editor" className="flex flex-1 flex-col overflow-hidden">
             <div className="flex items-center justify-center border-b border-border/40 px-4 py-1">
                <TabsList className="bg-transparent border-none">
                  <TabsTrigger value="editor" className="data-[state=active]:bg-secondary/50">
                    Editor
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="data-[state=active]:bg-secondary/50">
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="both" className="hidden lg:flex data-[state=active]:bg-secondary/50">
                    Side-by-Side
                  </TabsTrigger>
                </TabsList>
             </div>

             <TabsContent value="editor" className="flex-1 m-0 p-0 overflow-hidden">
                <textarea 
                  className="h-full w-full resize-none bg-background p-8 font-mono text-sm leading-relaxed outline-none focus:ring-0"
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                />
             </TabsContent>

             <TabsContent value="preview" className="flex-1 m-0 p-0 overflow-y-auto">
                <div className="mx-auto max-w-3xl p-8 prose prose-invert">
                   {/* GitHub-style rendering mockup */}
                   <div className="whitespace-pre-wrap font-sans">
                      {markdown}
                   </div>
                </div>
             </TabsContent>

             <TabsContent value="both" className="flex-1 m-0 p-0 overflow-hidden lg:flex">
                <div className="flex flex-1">
                  <div className="flex-1 border-r border-border/40">
                    <textarea 
                      className="h-full w-full resize-none bg-background p-6 font-mono text-sm leading-relaxed outline-none focus:ring-0"
                      value={markdown}
                      onChange={(e) => setMarkdown(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 bg-card/10">
                     <div className="prose prose-invert prose-sm whitespace-pre-wrap font-sans">
                        {markdown}
                     </div>
                  </div>
                </div>
             </TabsContent>
          </Tabs>
        </main>
        
        {/* Right Info Sidebar (Optional) */}
        <aside className="w-80 border-l border-border/40 bg-card/20 hidden xl:block overflow-y-auto">
           <div className="p-4 space-y-6">
              <div>
                 <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Analysis Context</h3>
                 <div className="space-y-4">
                    {analysis?.analysis_data?.language && (
                      <AnalysisItem 
                        label="Primary Language" 
                        value={analysis.analysis_data.language.value} 
                        confidence={analysis.analysis_data.language.confidence} 
                      />
                    )}

                    {analysis?.analysis_data?.frameworks && (
                      <AnalysisItem 
                        label="Frameworks" 
                        value={analysis.analysis_data.frameworks.value.join(", ")} 
                        confidence={analysis.analysis_data.frameworks.confidence} 
                      />
                    )}

                    {analysis?.analysis_data?.packageManager && (
                      <AnalysisItem 
                        label="Package Manager" 
                        value={analysis.analysis_data.packageManager.value} 
                        confidence={analysis.analysis_data.packageManager.confidence} 
                      />
                    )}

                    {analysis?.analysis_data?.license && (
                      <AnalysisItem 
                        label="License" 
                        value={analysis.analysis_data.license.value} 
                        confidence={analysis.analysis_data.license.confidence} 
                      />
                    )}

                    {analysis?.analysis_data?.envVars && (
                      <AnalysisItem 
                        label="Env Vars" 
                        value={analysis.analysis_data.envVars.value.length > 0 ? `${analysis.analysis_data.envVars.value.length} detected` : "None found"} 
                        confidence={analysis.analysis_data.envVars.confidence} 
                      />
                    )}
                 </div>
                 <Button variant="link" size="sm" className="mt-4 h-auto p-0 text-primary" asChild>
                    <Link to="/health" search={{ repositoryId: repositoryId || "" }}>View health report →</Link>
                 </Button>
              </div>

              <Separator />

              <div>
                 <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Documentation Status</h3>
                 <div className="space-y-3">
                    <StatusBadge label="README.md" exists={analysis?.analysis_data?.documentationStatus?.readme} />
                    <StatusBadge label="CONTRIBUTING.md" exists={analysis?.analysis_data?.documentationStatus?.contributing} />
                    <StatusBadge label="LICENSE" exists={analysis?.analysis_data?.documentationStatus?.license} />
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );

function AnalysisItem({ label, value, confidence }: { label: string, value: string | null, confidence: 'verified' | 'likely' | 'unknown' }) {
  if (confidence === 'unknown' && !value) {
    return (
      <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 border border-dashed border-border/60">
        <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
        <Badge variant="outline" className="text-[9px] text-muted-foreground opacity-50">Unknown</Badge>
      </div>
    );
  }

  return (
    <div className={`p-2 rounded-lg border ${
      confidence === 'verified' ? 'bg-emerald-500/5 border-emerald-500/20' : 
      confidence === 'likely' ? 'bg-amber-500/5 border-amber-500/20' : 
      'bg-secondary/20 border-border/40'
    }`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
        <Badge className={`text-[8px] h-3.5 px-1 ${
          confidence === 'verified' ? 'bg-emerald-500/20 text-emerald-400 border-none' : 
          confidence === 'likely' ? 'bg-amber-500/20 text-amber-400 border-none' : 
          'bg-muted text-muted-foreground border-none'
        }`}>
          {confidence}
        </Badge>
      </div>
      <p className="text-xs font-bold truncate">{value || "Not found"}</p>
    </div>
  );
}

function StatusBadge({ label, exists }: { label: string, exists: boolean }) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg border ${
      exists ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'
    }`}>
      {exists ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
      )}
      <span className={`text-xs ${exists ? 'text-emerald-200/80' : 'text-rose-200/80'}`}>{label}</span>
      <span className="ml-auto text-[9px] uppercase font-bold tracking-tighter opacity-50">
        {exists ? "Detected" : "Missing"}
      </span>
    </div>
  );
}

}
