import { createFileRoute, Link } from "@tanstack/react-router";
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
  Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

export const Route = createFileRoute("/editor/")({
  component: EditorPage,
});

const SECTIONS = [
  "Overview", "Features", "Installation", "Usage", "Tech Stack", 
  "Configuration", "Project Structure", "Screenshots", "Testing", 
  "Deployment", "Contributing", "License"
];

const MOCK_MARKDOWN = `# READMEForge

AI-powered GitHub README generator, analyzer, and documentation quality checker.

## Features

- **Repository Analysis**: Automatic detection of technologies, dependencies, and structure.
- **AI Generation**: Accurate READMEs based on actual codebase.
- **Health Score**: Quality evaluation and improvement suggestions.
- **GitHub Preview**: Real-time rendering matching GitHub's style.

## Installation

\`\`\`bash
npm install readme-forge
\`\`\`

## Usage

1. Enter repository URL.
2. Analyze and generate.
3. Export your README.md.
`;

function EditorPage() {
  const [markdown, setMarkdown] = useState(MOCK_MARKDOWN);

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {/* Editor Header */}
      <header className="flex h-14 items-center justify-between border-b border-border/40 bg-card/30 px-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/analyzer">
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
          <Button variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Save className="mr-2 h-4 w-4" />
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
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs border-primary/20 bg-primary/5 text-primary">
                      <Sparkles className="mr-2 h-3 w-3" />
                      Improve with AI
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
                   <div dangerouslySetInnerHTML={{ __html: markdown.replace(/\n/g, '<br />') }} />
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
                     <div className="prose prose-invert prose-sm">
                        <div dangerouslySetInnerHTML={{ __html: markdown.replace(/\n/g, '<br />') }} />
                     </div>
                  </div>
                </div>
             </TabsContent>
          </Tabs>
        </main>
        
        {/* Right Info Sidebar (Optional) */}
        <aside className="w-64 border-l border-border/40 bg-card/20 hidden xl:block">
           <div className="p-4 space-y-6">
              <div>
                 <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">README Health</h3>
                 <div className="flex items-end gap-2 mb-2">
                    <span className="text-3xl font-bold">87</span>
                    <span className="text-sm text-muted-foreground mb-1">/100</span>
                 </div>
                 <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '87%' }} />
                 </div>
                 <Button variant="link" size="sm" className="mt-2 h-auto p-0 text-primary" asChild>
                    <Link to="/health">View full report →</Link>
                 </Button>
              </div>

              <Separator />

              <div>
                 <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Quick Suggestions</h3>
                 <div className="space-y-3">
                    <div className="flex gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                       <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                       <div className="text-xs">
                          <p className="font-bold text-amber-200">Missing License</p>
                          <p className="text-amber-200/70">Adding a license is recommended for open source.</p>
                       </div>
                    </div>
                    <div className="flex gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                       <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                       <p className="text-xs text-emerald-200/70">Project structure detected and documented.</p>
                    </div>
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}
