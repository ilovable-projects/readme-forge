import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { 
  ArrowRight,
  Eye,
  Search,
  Zap,
  Sparkles,
  Loader2,
  Check,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { TEMPLATES, type TemplateConfig } from "@/lib/readme-templates";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-data";
import { toast } from "sonner";

export const Route = createFileRoute("/templates/")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateConfig | null>(null);
  const [confirmTemplate, setConfirmTemplate] = useState<TemplateConfig | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [lastRepositoryId, setLastRepositoryId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from('repositories')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setLastRepositoryId(data.id);
        });
    }
  }, [user]);

  const filteredTemplates = TEMPLATES.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const applyTemplate = async (template: TemplateConfig) => {
    if (!user || !lastRepositoryId) {
      toast.error("Please analyze a repository first.");
      return;
    }

    setIsApplying(true);
    try {
      const { data: existingDoc } = await supabase
        .from('readme_documents')
        .select('*')
        .eq('repository_id', lastRepositoryId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const badgeStr = template.default_badges.map(b => `![Badge](https://img.shields.io/badge/${b}-template-blue)`).join(' ');
      const content = `# Project Name\n\n${badgeStr}\n\n${template.section_order.map(s => `## ${s}\n\nPlaceholder for ${s.toLowerCase()}...`).join('\n\n')}`;

      if (existingDoc && existingDoc.markdown_content) {
        setConfirmTemplate(template);
        setIsApplying(false);
        return;
      }

      const { error } = await supabase
        .from('readme_documents')
        .insert([{
          user_id: user.id,
          repository_id: lastRepositoryId,
          title: `README (${template.name})`,
          markdown_content: content,
          template: template.id
        }]);

      if (error) throw error;

      toast.success(`Template "${template.name}" applied!`);
      navigate({ to: '/editor', search: { repositoryId: lastRepositoryId } });
    } catch (error: any) {
      toast.error("Failed to apply template: " + error.message);
    } finally {
      setIsApplying(false);
    }
  };

  const handleConfirmReplace = async () => {
    if (!confirmTemplate || !user || !lastRepositoryId) return;
    
    setIsApplying(true);
    try {
      const badgeStr = confirmTemplate.default_badges.map(b => `![Badge](https://img.shields.io/badge/${b}-template-blue)`).join(' ');
      const content = `# Project Name\n\n${badgeStr}\n\n${confirmTemplate.section_order.map(s => `## ${s}\n\nPlaceholder for ${s.toLowerCase()}...`).join('\n\n')}`;

      await supabase
        .from('readme_documents')
        .update({
          markdown_content: content,
          template: confirmTemplate.id,
          updated_at: new Date().toISOString()
        })
        .eq('repository_id', lastRepositoryId);

      toast.success(`Template "${confirmTemplate.name}" applied successfully!`);
      navigate({ to: '/editor', search: { repositoryId: lastRepositoryId } });
    } catch (error: any) {
      toast.error("Failed to apply template: " + error.message);
    } finally {
      setIsApplying(false);
      setConfirmTemplate(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">README Templates</h1>
            <p className="text-muted-foreground">Select a professional starting point tailored for your project.</p>
          </div>
          <div className="w-full md:w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search templates..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card/50 border-border/50"
              />
            </div>
          </div>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group border-border/40 bg-card/50 hover:bg-card/80 transition-all hover:-translate-y-1 flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/10 transition-colors">
                    <template.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-[10px] tracking-widest font-bold uppercase bg-secondary/50">
                    {template.category}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{template.name}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1 min-h-[40px]">{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-4 space-y-4 flex-1">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Recommended for</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{template.recommended_for}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {template.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-[10px] py-0 border-border/50 text-muted-foreground font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  Preview
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => applyTemplate(template)}
                  disabled={isApplying}
                >
                  {isApplying ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <>Use This <ArrowRight className="ml-2 h-3.5 w-3.5" /></>}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {previewTemplate?.name} Preview
                <Badge variant="outline" className="text-[10px] uppercase">{previewTemplate?.style}</Badge>
              </DialogTitle>
              <DialogDescription>
                Showing structure and sections for the {previewTemplate?.name} template.
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="flex-1 p-6 bg-secondary/20 rounded-lg border border-border/40">
              <div className="markdown-body !bg-transparent !font-sans !text-sm max-w-none prose dark:prose-invert">
                <h1>{previewTemplate?.name} Project</h1>
                <div className="flex gap-2 mb-8">
                  {previewTemplate?.default_badges.map(b => (
                    <img key={b} src={`https://img.shields.io/badge/${b}-template-blue`} alt={b} className="h-5" />
                  ))}
                </div>
                {previewTemplate?.section_order.map(s => (
                  <div key={s} className="mb-6">
                    <h2 className="text-xl font-bold border-b border-border/40 pb-2 mb-3">## {s}</h2>
                    <div className="h-8 bg-primary/5 rounded border border-dashed border-primary/20 flex items-center px-4 text-xs text-muted-foreground italic">
                      Verified content for {s.toLowerCase()} will be placed here...
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <DialogFooter className="mt-4">
              <Button variant="ghost" onClick={() => setPreviewTemplate(null)}>Close Preview</Button>
              <Button onClick={() => {
                if (previewTemplate) applyTemplate(previewTemplate);
                setPreviewTemplate(null);
              }}>
                Apply This Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!confirmTemplate} onOpenChange={(open) => !open && setConfirmTemplate(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="h-5 w-5" />
                Replace Existing Content?
              </DialogTitle>
              <DialogDescription>
                We detected an existing README for this repository. Applying the "{confirmTemplate?.name}" template will replace your current content with the template structure.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-secondary/20 rounded-md border border-border/40 space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase">New Structure:</p>
              <div className="flex flex-wrap gap-1">
                {confirmTemplate?.section_order.map(s => (
                  <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setConfirmTemplate(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleConfirmReplace} disabled={isApplying}>
                {isApplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Replace & Apply"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card className="border-primary/20 bg-primary/5 p-8 relative overflow-hidden">
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                 <h2 className="text-2xl font-bold tracking-tight flex items-center justify-center md:justify-start gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    AI-Driven Customization
                 </h2>
                 <p className="text-muted-foreground max-w-md">Can't find exactly what you need? Our AI can blend templates or create a custom layout based on your repository structure.</p>
              </div>
              <Button size="lg" className="shadow-lg shadow-primary/20">
                 <Zap className="mr-2 h-4 w-4" />
                 Generate Custom Layout
              </Button>
           </div>
           <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
           <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-primary/5 blur-[100px]" />
        </Card>
      </div>
    </div>
  );
}
