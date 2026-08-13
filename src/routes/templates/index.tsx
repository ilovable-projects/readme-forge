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
  const [search, setSearch] = useState("");

  const filteredTemplates = TEMPLATES.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">README Templates</h1>
            <p className="text-muted-foreground">Select a starting point for your project documentation.</p>
          </div>
          <div className="w-full md:w-80">
            <Input 
              placeholder="Search templates..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card/50 border-border/50"
            />
          </div>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group border-border/40 bg-card/50 hover:bg-card/80 transition-all hover:-translate-y-1">
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
                <CardDescription className="line-clamp-2 mt-1">{template.desc}</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex gap-2 flex-wrap">
                  {template.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-[10px] py-0 border-border/50 text-muted-foreground font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1 text-xs">
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  Preview
                </Button>
                <Button size="sm" className="flex-1 text-xs">
                  Use This
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* AI Customization Callout */}
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
           {/* Abstract Background Element */}
           <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
           <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-primary/5 blur-[100px]" />
        </Card>
      </div>
    </div>
  );
}
