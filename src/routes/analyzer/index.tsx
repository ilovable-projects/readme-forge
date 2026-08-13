import { createFileRoute } from "@tanstack/react-router";
import { 
  Search, 
  ArrowRight, 
  Loader2, 
  Database, 
  Code, 
  Terminal, 
  ShieldCheck, 
  FileCheck,
  Zap 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

export const Route = createFileRoute("/analyzer")({
  component: AnalyzerPage,
});

function AnalyzerPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const startAnalysis = () => {
    setAnalyzing(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setAnalyzing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Repository Analyzer</h1>
          <p className="text-muted-foreground">Enter a public repository URL to begin scanning.</p>
        </div>

        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Input 
                placeholder="https://github.com/username/repo" 
                className="h-12 border-border/50"
              />
              <Button size="lg" className="h-12" onClick={startAnalysis} disabled={analyzing}>
                {analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                {analyzing ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {analyzing && (
          <div className="space-y-4 rounded-xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm">
            <div className="flex justify-between text-sm font-medium">
              <span>Analyzing repository...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="grid gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> Scanning repository structure</div>
              <div className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> Detecting technologies and frameworks</div>
            </div>
          </div>
        )}

        {!analyzing && progress === 100 && (
          <div className="grid gap-6 animate-in fade-in zoom-in duration-500">
            <Card className="border-border/40 bg-card/50 p-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center">
                  <Github className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">raheelnadeem / readme-forge</h2>
                  <p className="text-muted-foreground mt-1">AI-powered GitHub README generator and analyzer.</p>
                  <div className="flex gap-4 mt-4 text-sm font-medium text-muted-foreground">
                    <span>★ 12</span>
                    <span>⑂ 2</span>
                    <Badge variant="outline">TypeScript</Badge>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: Database, title: "Environment Variables", items: [".env.example", ".env"] },
                { icon: Code, title: "Detected Frameworks", items: ["React 19", "Tailwind CSS", "TanStack Start"] },
                { icon: Terminal, title: "Scripts", items: ["dev", "build", "preview", "lint"] },
                { icon: ShieldCheck, title: "License", items: ["MIT License"] }
              ].map((section, i) => (
                <Card key={i} className="bg-card/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-primary">
                      <section.icon className="h-4 w-4" />
                      {section.title}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {section.items.map((item, j) => (
                        <li key={j} className="text-sm text-muted-foreground">{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button className="w-full h-12 text-lg shadow-xl shadow-primary/20" asChild>
              <Link to="/editor">Generate README →</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Github(props: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.26 1.23-.26 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
}
