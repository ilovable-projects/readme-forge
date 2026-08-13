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
  Loader2,
  Undo2,
  ArrowUpRight,
  Check,
  ShieldCheck,
  Code2,
  Zap,
  GitGraph,
  Layers,
  ExternalLink,
  ClipboardCheck,
  FileCode,
  ArrowRight,
  GitBranch,
  FileBox,
  MessageSquare,
  History,
  Diff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-data";
import { toast } from "sonner";
import { z } from "zod";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import debounce from "lodash.debounce";
import { useServerFn } from "@tanstack/react-start";
import { editReadmeSection } from "@/lib/readme-editor.functions";
import { calculateReadmeScore } from "@/lib/readme-health.functions";
import { commitReadmeToGithub } from "@/lib/github-commit.functions";
import { checkReadmeFreshness, FreshnessStatus } from "@/lib/readme-freshness.functions";
import { updateReadmeWithAi } from "@/lib/readme-update.functions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const editorSearchSchema = z.object({
  repositoryId: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/editor")({
  validateSearch: (search) => editorSearchSchema.parse(search),
  component: EditorPage,
});

const SECTIONS = [
  "Overview", "Features", "Installation", "Usage", "Tech Stack", 
  "Configuration", "Project Structure", "Screenshots", "Testing", 
  "Deployment", "Contributing", "License"
];

const AI_ACTIONS = [
  { id: "improve", label: "Improve", icon: Sparkles },
  { id: "simplify", label: "Simplify", icon: Eye },
  { id: "professionalize", label: "Professionalize", icon: ShieldCheck },
  { id: "fix_grammar", label: "Fix Grammar", icon: CheckCircle2 },
  { id: "more_technical", label: "Make More Technical", icon: Code2 },
  { id: "beginner_friendly", label: "Make More Beginner Friendly", icon: Zap },
];

function EditorPage() {
  const { repositoryId } = useSearch({ from: '/_authenticated/editor' });
  const { user } = useAuth();
  const editSectionFn = useServerFn(editReadmeSection);
  const calculateScoreFn = useServerFn(calculateReadmeScore);
  const commitToGithubFn = useServerFn(commitReadmeToGithub);
  const checkFreshnessFn = useServerFn(checkReadmeFreshness);
  const updateWithAiFn = useServerFn(updateReadmeWithAi);

  const [markdown, setMarkdown] = useState("");
  const [initialMarkdown, setInitialMarkdown] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!repositoryId);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [isCommitSuccessOpen, setIsCommitSuccessOpen] = useState(false);
  const [commitData, setCommitData] = useState({
    message: "docs: improve README",
    path: "README.md",
    branch: "",
  });
  const [commitResult, setCommitResult] = useState<any>(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [freshnessStatus, setFreshnessStatus] = useState<FreshnessStatus | null>(null);
  const [isFreshnessModalOpen, setIsFreshnessModalOpen] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [pendingUpdatedMarkdown, setPendingUpdatedMarkdown] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load document and analysis
  useEffect(() => {
    if (repositoryId && user) {
      loadDocument();
    }
  }, [repositoryId, user]);

  const loadDocument = async () => {
    setIsLoading(true);
    try {
      const { data: analysisData } = await supabase
        .from('repository_analyses')
        .select('*, repositories(*)')
        .eq('repository_id', repositoryId!)
        .maybeSingle();
      
      if (analysisData) {
        setAnalysis(analysisData);
        setCommitData(prev => ({
          ...prev,
          branch: (analysisData as any).repositories?.default_branch || 'main'
        }));
      }

      const { data, error } = await supabase
        .from('readme_documents')
        .select('*')
        .eq('repository_id', repositoryId!)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setMarkdown(data.markdown_content || "");
        setInitialMarkdown(data.markdown_content || "");
        setDocumentId(data.id);
        // Check freshness after loading
        handleCheckFreshness(repositoryId!, data.id);
      }
    } catch (error: any) {
      toast.error("Failed to load document: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced autosave
  const debouncedSave = useCallback(
    debounce(async (content: string, docId: string | null) => {
      if (!user || !repositoryId || !content) return;
      
      setIsSaving(true);
      try {
        let currentDocId = docId;
        if (currentDocId) {
          await supabase
            .from('readme_documents')
            .update({ markdown_content: content, updated_at: new Date().toISOString() })
            .eq('id', currentDocId);
        } else {
          const { data } = await supabase
            .from('readme_documents')
            .insert([{
              user_id: user.id,
              repository_id: repositoryId,
              title: 'README.md',
              markdown_content: content
            }])
            .select()
            .single();
          if (data) {
            currentDocId = data.id;
            setDocumentId(data.id);
          }
        }

        // Trigger health score recalculation
        if (currentDocId) {
          await calculateScoreFn({
            data: {
              documentId: currentDocId,
              repositoryId: repositoryId,
              content: content
            }
          });
        }
      } catch (e) {
        console.error("Autosave/Health score failed", e);
      } finally {
        setIsSaving(false);
      }
    }, 2000),
    [user, repositoryId, calculateScoreFn]
  );

  useEffect(() => {
    if (markdown && markdown !== initialMarkdown) {
      debouncedSave(markdown, documentId);
    }
  }, [markdown, documentId, debouncedSave, initialMarkdown]);

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      if (prev !== undefined) {
        setMarkdown(prev);
      }
      setHistory(prevHistory => prevHistory.slice(0, -1));
      toast.info("Changes reverted");
    }
  };

  const extractSection = (content: string, sectionTitle: string) => {
    const lines = content.split('\n');
    let startIndex = -1;
    let endIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i]?.toLowerCase().includes(`## ${sectionTitle.toLowerCase()}`)) {
        startIndex = i;
        break;
      }
    }

    if (startIndex === -1) return null;

    for (let i = startIndex + 1; i < lines.length; i++) {
      if (lines[i]?.startsWith('## ')) {
        endIndex = i;
        break;
      }
    }

    if (endIndex === -1) endIndex = lines.length;

    return {
      startIndex,
      endIndex,
      content: lines.slice(startIndex, endIndex).join('\n')
    };
  };

  const handleAiAction = async (action: typeof AI_ACTIONS[0]) => {
    if (!selectedSection || !documentId) {
      toast.error("Please select a section from the sidebar first.");
      return;
    }

    const section = extractSection(markdown, selectedSection);
    if (!section) {
      toast.error(`Section "${selectedSection}" not found in your README.`);
      return;
    }

    setIsAiLoading(true);
    try {
      setHistory(prev => [...prev, markdown]);
      
      const result = await editSectionFn({
        data: {
          documentId,
          sectionTitle: selectedSection,
          currentContent: section.content,
          action: action.id as any,
          context: analysis?.analysis_data || {}
        }
      });

      const lines = markdown.split('\n');
      const newLines = [
        ...lines.slice(0, section.startIndex),
        result.newContent,
        ...lines.slice(section.endIndex)
      ];

      setMarkdown(newLines.join('\n'));
      toast.success(`${action.label} applied to ${selectedSection}`);
    } catch (error: any) {
      toast.error("AI action failed: " + error.message);
      setHistory(prev => prev.slice(0, -1));
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleReset = () => {
    if (initialMarkdown) {
      setHistory(prev => [...prev, markdown]);
      setMarkdown(initialMarkdown);
      toast.info("Reset to initial version");
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'README.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("README.md downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download README.md");
    }
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(markdown);
      toast.success("Markdown copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleCommit = async () => {
    if (!analysis?.repositories || !markdown) return;
    
    setIsCommitting(true);
    try {
      const result = await commitToGithubFn({
        data: {
          repositoryId: repositoryId!,
          owner: (analysis as any).repositories.owner,
          repo: (analysis as any).repositories.name,
          branch: commitData.branch,
          path: commitData.path,
          content: markdown,
          message: commitData.message,
        }
      });
      
      setCommitResult(result);
      setIsCommitModalOpen(false);
      setIsCommitSuccessOpen(true);
      toast.success("Committed to GitHub successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to commit to GitHub");
    } finally {
      setIsCommitting(false);
    }
  };

  const handleCheckFreshness = async (repoId: string, docId: string) => {
    try {
      const result = await checkFreshnessFn({
        data: { repositoryId: repoId, documentId: docId }
      });
      setFreshnessStatus(result);
    } catch (e) {
      console.error("Freshness check failed", e);
    }
  };

  const handleUpdateWithAi = async () => {
    if (!freshnessStatus || !repositoryId || !documentId) return;
    
    setIsAiLoading(true);
    try {
      const result = await updateWithAiFn({
        data: {
          documentId,
          repositoryId,
          currentContent: markdown,
          differences: freshnessStatus.differences
        }
      });
      
      setPendingUpdatedMarkdown(result.updatedContent);
      setIsFreshnessModalOpen(false);
      setIsDiffModalOpen(true);
    } catch (error: any) {
      toast.error("AI update failed: " + error.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyAiUpdate = () => {
    setHistory(prev => [...prev, markdown]);
    setMarkdown(pendingUpdatedMarkdown);
    setIsDiffModalOpen(false);
    toast.success("README updated with AI suggestions");
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
      <header className="flex h-14 items-center justify-between border-b border-border/40 bg-card/30 px-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-bold truncate max-w-[100px] md:max-w-[200px]">
              {analysis?.repositories?.name || "README.md"}
            </span>
            <Badge variant="secondary" className="ml-2 text-[10px] uppercase tracking-tighter">
              {isSaving ? "Saving..." : "Saved"}
            </Badge>
            {freshnessStatus && !freshnessStatus.isUpToDate && (
              <Badge 
                variant="outline" 
                className="ml-2 text-[10px] uppercase tracking-tighter border-amber-500/50 text-amber-500 cursor-pointer hover:bg-amber-500/10"
                onClick={() => setIsFreshnessModalOpen(true)}
              >
                Outdated
              </Badge>
            )}
            {freshnessStatus && freshnessStatus.isUpToDate && (
              <Badge variant="outline" className="ml-2 text-[10px] uppercase tracking-tighter border-emerald-500/50 text-emerald-500">
                Up to date
              </Badge>
            )}
          </div>
        </div>
        
        <div className="hidden xl:flex items-center gap-2">
          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleUndo}>
              <Undo2 className="mr-2 h-4 w-4" />
              Undo
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsCommitModalOpen(true)} className="border-primary/20 hover:bg-primary/5">
            <Code2 className="mr-2 h-4 w-4" />
            Commit to GitHub
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsExportModalOpen(true)}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/templates">
              <Layers className="mr-2 h-4 w-4" />
              Change Template
            </Link>
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => debouncedSave(markdown, documentId)} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save
          </Button>
        </div>

        <div className="flex xl:hidden items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Actions
                <ChevronRight className="ml-2 h-4 w-4 rotate-90" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>README Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleReset}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reset Version
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsCommitModalOpen(true)}>
                <Code2 className="mr-2 h-4 w-4" />
                Commit to GitHub
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsExportModalOpen(true)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Export README
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/templates">
                  <Layers className="mr-2 h-4 w-4" />
                  Change Template
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => debouncedSave(markdown, documentId)} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                Save Now
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-border/40 bg-card/20 overflow-y-auto hidden md:block">
          <div className="p-4">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Sections</h3>
            <div className="space-y-1">
              {SECTIONS.map((section) => {
                const isDetected = markdown.toLowerCase().includes(`## ${section.toLowerCase()}`);
                return (
                  <button 
                    key={section}
                    onClick={() => setSelectedSection(section)}
                    className={`flex w-full items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors text-left ${
                      selectedSection === section ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary/50 text-muted-foreground'
                    }`}
                  >
                    <span>{section}</span>
                    {isDetected && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                  </button>
                );
              })}
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
               <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">AI Actions</h4>
                  <div className="space-y-2">
                    {AI_ACTIONS.map((action) => (
                      <Button 
                        key={action.id}
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start text-xs border-border/40 hover:border-primary/40 hover:bg-primary/5 group"
                        disabled={isAiLoading || !selectedSection}
                        onClick={() => handleAiAction(action)}
                      >
                        {isAiLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <action.icon className="mr-2 h-3 w-3 text-muted-foreground group-hover:text-primary" />}
                        {action.label}
                      </Button>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </aside>

        <main className="flex flex-1 overflow-hidden">
          <Tabs defaultValue="editor" className="flex flex-1 flex-col overflow-hidden">
             <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border/40 bg-background/80 px-4 py-1 backdrop-blur-sm">
                <div className="flex items-center gap-1">
                  <TabsList className="bg-transparent border-none">
                    <TabsTrigger value="editor" className="data-[state=active]:bg-secondary/50">
                      Editor
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="data-[state=active]:bg-secondary/50">
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="both" className="hidden lg:flex data-[state=active]:bg-secondary/50">
                      Split View
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="flex items-center gap-2">
                   <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/30 border border-border/20 text-[10px] text-muted-foreground font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Markdown Mode
                   </div>
                </div>
             </div>

             <TabsContent value="editor" className="flex-1 m-0 p-0 overflow-hidden relative">
                {isAiLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm font-medium">AI is working on "{selectedSection}"...</p>
                  </div>
                )}
                <textarea 
                  ref={textareaRef}
                  className="h-full w-full resize-none bg-background p-4 md:p-8 font-mono text-sm leading-relaxed outline-none focus:ring-0 custom-scrollbar"
                  value={markdown}
                  onChange={handleMarkdownChange}
                  placeholder="Start writing your README..."
                />
             </TabsContent>

             <TabsContent value="preview" className="flex-1 m-0 p-0 overflow-y-auto bg-card/5 scroll-smooth custom-scrollbar relative">
                <div className="mx-auto max-w-4xl p-4 md:p-6 lg:p-12">
                   <Card className="border-border/40 shadow-xl bg-background overflow-hidden">
                      <CardContent className="p-0">
                         <div className="flex items-center gap-2 border-b border-border/40 bg-secondary/20 px-4 py-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground tracking-tight">README.md</span>
                            <div className="ml-auto flex items-center gap-1.5">
                               <div className="h-2 w-2 rounded-full bg-border"></div>
                               <div className="h-2 w-2 rounded-full bg-border"></div>
                               <div className="h-2 w-2 rounded-full bg-border"></div>
                            </div>
                         </div>
                         <div className="p-4 md:p-10">
                            <div className="markdown-body !bg-transparent !font-sans max-w-none prose dark:prose-invert prose-pre:p-0 prose-pre:bg-transparent">
                               <ReactMarkdown 
                                 remarkPlugins={[remarkGfm]} 
                                 rehypePlugins={[rehypeHighlight]}
                               >
                                 {markdown}
                               </ReactMarkdown>
                            </div>
                         </div>
                      </CardContent>
                   </Card>
                </div>
             </TabsContent>

             <TabsContent value="both" className="flex-1 m-0 p-0 overflow-hidden lg:flex">
                <div className="flex flex-1">
                  <div className="flex-1 border-r border-border/40 relative">
                    {isAiLoading && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}
                    <textarea 
                      className="h-full w-full resize-none bg-background p-6 font-mono text-sm leading-relaxed outline-none focus:ring-0 custom-scrollbar"
                      value={markdown}
                      onChange={handleMarkdownChange}
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 bg-card/5 custom-scrollbar">
                    <Card className="border-border/40 shadow-lg bg-background overflow-hidden">
                       <div className="flex items-center gap-2 border-b border-border/40 bg-secondary/10 px-4 py-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Preview</span>
                       </div>
                       <div className="p-6">
                          <div className="markdown-body !bg-transparent !font-sans !text-[13px] max-w-none prose dark:prose-invert prose-pre:p-0 prose-pre:bg-transparent">
                             <ReactMarkdown 
                               remarkPlugins={[remarkGfm]} 
                               rehypePlugins={[rehypeHighlight]}
                             >
                               {markdown}
                             </ReactMarkdown>
                          </div>
                       </div>
                    </Card>
                  </div>
                </div>
             </TabsContent>
          </Tabs>
        </main>
        
        <aside className="w-72 border-l border-border/40 bg-card/20 hidden xl:block overflow-y-auto">
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
                 </div>
                 <Button variant="link" size="sm" className="mt-4 h-auto p-0 text-primary" asChild>
                    <Link to="/health" search={{ repositoryId: repositoryId || "" }}>View health report →</Link>
                 </Button>
              </div>

              <Separator />

              <div>
                 <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Documentation</h3>
                 <div className="space-y-3">
                    <StatusBadge label="README.md" exists={analysis?.analysis_data?.documentationStatus?.readme} />
                    <StatusBadge label="CONTRIBUTING.md" exists={analysis?.analysis_data?.documentationStatus?.contributing} />
                    <StatusBadge label="LICENSE" exists={analysis?.analysis_data?.documentationStatus?.license} />
                 </div>
              </div>
           </div>
        </aside>
      </div>
      <ExportModal />
      <CommitModal />
      <CommitSuccessModal />
      <FreshnessModal />
      <DiffModal />
    </div>
  );

  function FreshnessModal() {
    if (!freshnessStatus) return null;
    
    return (
      <Dialog open={isFreshnessModalOpen} onOpenChange={setIsFreshnessModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/5">
                Potentially Outdated
              </Badge>
              <span className="text-xs text-muted-foreground">Detected {freshnessStatus.differences.length} changes</span>
            </div>
            <DialogTitle className="text-xl">Review Changes</DialogTitle>
            <DialogDescription>
              The repository has changed since this README was last updated.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-4">
              {freshnessStatus.differences.map((diff, i) => (
                <div key={i} className="p-4 rounded-lg border border-border/40 bg-secondary/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                      {diff.type}
                    </Badge>
                    <Badge className={`text-[10px] ${
                      diff.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                      diff.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-blue-500/20 text-blue-400'
                    } border-none`}>
                      {diff.severity}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm">{diff.label}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground/60">In README</span>
                      <div className="p-2 rounded bg-background border border-border/20 text-xs font-mono line-clamp-1 italic text-muted-foreground">
                        {diff.readmeValue || "Not found"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-500/60">In Repository</span>
                      <div className="p-2 rounded bg-emerald-500/5 border border-emerald-500/20 text-xs font-mono font-bold line-clamp-1">
                        {diff.repoValue}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 border-t border-border/40 bg-secondary/5">
            <Button variant="ghost" onClick={() => setIsFreshnessModalOpen(false)}>Ignore</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleUpdateWithAi} disabled={isAiLoading}>
              {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Update README with AI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function DiffModal() {
    return (
      <Dialog open={isDiffModalOpen} onOpenChange={setIsDiffModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <div className="flex items-center gap-2 mb-2">
              <History className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Preview AI Updates</span>
            </div>
            <DialogTitle className="text-xl">Review Changes before Saving</DialogTitle>
            <DialogDescription>
              AI has updated the README to reflect latest repository changes while preserving your custom content.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden border-y border-border/40">
            <div className="flex flex-col overflow-hidden border-r border-border/40">
              <div className="bg-secondary/20 p-2 text-[10px] font-bold uppercase tracking-widest border-b border-border/40">Original</div>
              <ScrollArea className="flex-1 p-4 bg-background font-mono text-[11px] leading-relaxed opacity-60">
                <pre className="whitespace-pre-wrap">{markdown}</pre>
              </ScrollArea>
            </div>
            <div className="flex flex-col overflow-hidden">
              <div className="bg-emerald-500/10 p-2 text-[10px] font-bold uppercase tracking-widest border-b border-border/40 text-emerald-500">Proposed Update</div>
              <ScrollArea className="flex-1 p-4 bg-emerald-500/[0.02] font-mono text-[11px] leading-relaxed">
                <pre className="whitespace-pre-wrap">{pendingUpdatedMarkdown}</pre>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter className="p-6 bg-secondary/5">
            <Button variant="ghost" onClick={() => setIsDiffModalOpen(false)}>Discard</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={applyAiUpdate}>
              <Check className="mr-2 h-4 w-4" />
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function ExportModal() {
    return (
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export README</DialogTitle>
            <DialogDescription>
              Choose how you want to export your generated README.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col gap-2">
              <Button onClick={handleCopy} variant="outline" className="w-full justify-start">
                <Copy className="mr-2 h-4 w-4" />
                Copy Markdown Text
              </Button>
              <Button onClick={handleDownload} variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Download README.md
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsExportModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function CommitModal() {
    return (
      <Dialog open={isCommitModalOpen} onOpenChange={setIsCommitModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Commit to GitHub
            </DialogTitle>
            <DialogDescription>
              Ready to push your changes? This will create a commit directly to your repository.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Repository</Label>
                <div className="flex items-center gap-2 text-sm font-medium bg-secondary/30 p-2 rounded border border-border/40">
                  <GitGraph className="h-4 w-4 text-primary" />
                  {(analysis as any)?.repositories?.owner}/{(analysis as any)?.repositories?.name}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Branch</Label>
                <div className="relative">
                  <GitBranch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input 
                    id="branch"
                    value={commitData.branch}
                    onChange={(e) => setCommitData({...commitData, branch: e.target.value})}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="path" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">File Path</Label>
              <div className="relative">
                <FileBox className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  id="path"
                  value={commitData.path}
                  onChange={(e) => setCommitData({...commitData, path: e.target.value})}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Commit Message</Label>
              <div className="relative">
                <MessageSquare className="absolute left-2.5 top-3 h-3.5 w-3.5 text-muted-foreground" />
                <Textarea 
                  id="message"
                  value={commitData.message}
                  onChange={(e) => setCommitData({...commitData, message: e.target.value})}
                  className="pl-8 min-h-[80px] text-sm py-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preview</Label>
              <div className="max-h-[150px] overflow-y-auto bg-muted/30 p-3 rounded text-[10px] font-mono whitespace-pre-wrap border border-border/20">
                {markdown.slice(0, 500)}{markdown.length > 500 ? '...' : ''}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCommitModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCommit} 
              disabled={isCommitting || !commitData.branch || !commitData.path || !commitData.message}
              className="bg-primary hover:bg-primary/90"
            >
              {isCommitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Committing...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Confirm Commit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function CommitSuccessModal() {
    return (
      <Dialog open={isCommitSuccessOpen} onOpenChange={setIsCommitSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center pt-4 pb-2">
            <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <DialogTitle className="text-2xl font-bold">Commit successful</DialogTitle>
          </div>
          
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm p-3 rounded bg-secondary/30 border border-border/40">
                <span className="text-muted-foreground">Repository</span>
                <span className="font-medium">{commitResult?.repository}</span>
              </div>
              <div className="flex justify-between items-center text-sm p-3 rounded bg-secondary/30 border border-border/40">
                <span className="text-muted-foreground">Branch</span>
                <span className="font-medium font-mono">{commitResult?.branch}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded bg-secondary/30 border border-border/40">
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Commit Message</span>
                <span className="text-sm italic">"{commitResult?.message}"</span>
              </div>
            </div>

            <Button asChild className="w-full mt-4" variant="outline">
              <a href={commitResult?.html_url} target="_blank" rel="noopener noreferrer">
                View on GitHub
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
          
          <DialogFooter>
            <Button className="w-full" onClick={() => setIsCommitSuccessOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
}

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

function ExportModal({ 
  isOpen, 
  onClose, 
  onDownload, 
  onCopy 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onDownload: () => void;
  onCopy: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border/40 p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            Export README
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1">
            Choose your preferred format to export your professional README.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div 
            className="group cursor-pointer p-4 rounded-xl border border-border/40 bg-secondary/10 hover:bg-secondary/20 hover:border-primary/30 transition-all"
            onClick={onDownload}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <FileCode className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">README.md</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Download as a standard Markdown file ready to be uploaded to GitHub.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors self-center" />
            </div>
          </div>

          <div 
            className="group cursor-pointer p-4 rounded-xl border border-border/40 bg-secondary/10 hover:bg-secondary/20 hover:border-primary/30 transition-all"
            onClick={onCopy}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">Markdown Text</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Copy the raw Markdown text directly to your clipboard.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors self-center" />
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 sm:justify-start">
          <Button variant="ghost" onClick={onClose} className="text-xs">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
