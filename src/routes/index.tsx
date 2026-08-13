import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  GitGraph, 
  Search, 
  FileText, 
  CheckCircle2, 
  BarChart3, 
  Layout, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  Code2,
  Sparkles
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    title: "READMEForge | Turn Any GitHub Repository Into a Professional README",
    meta: [
      { name: "description", content: "AI-powered GitHub README generator and analyzer. Analyze your repository, generate accurate documentation, and keep your README in sync with your code." },
      { property: "og:title", content: "READMEForge | AI-Powered README Generator" },
      { property: "og:description", content: "Professional GitHub READMEs generated from your actual repository contents." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  const handleAnalyze = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!url) return;
    
    // Basic validation before navigating
    const githubUrlPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    if (!githubUrlPattern.test(url)) {
      // If it doesn't match the strict pattern, we still navigate but let the analyzer handle it
      // or we can show a quick toast here.
    }
    
    navigate({ to: "/analyzer", search: { url } });
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary group-hover:scale-105 transition-transform">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">READMEForge</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">How it works</a>
            <a href="#templates" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Templates</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Log in</Link>
            </Button>
            <Button size="sm" className="rounded-full shadow-lg shadow-primary/20" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <Badge variant="outline" className="mb-6 rounded-full border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold tracking-wider text-primary uppercase">
                <Sparkles className="mr-2 h-3 w-3" />
                Next-Gen Developer Tools
              </Badge>
              <h1 className="mb-8 text-5xl font-extrabold tracking-tight sm:text-7xl">
                Turn Any GitHub Repository Into a <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Professional README</span>
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                Analyze your repository, generate accurate documentation, and keep your README in sync with your code. Support for all major languages and frameworks.
              </p>
              
              <form onSubmit={handleAnalyze} className="mx-auto mb-12 flex max-w-2xl flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <GitGraph className="absolute top-3 left-4 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="https://github.com/username/repo" 
                    className="h-12 border-border/50 bg-secondary/30 pl-11 ring-offset-background focus-visible:ring-primary/30"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 rounded-lg px-8 shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-primary/30">
                  Analyze Repository
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              
              <p className="mb-16 text-sm text-muted-foreground">
                Supporting all public GitHub repositories. No access required.
              </p>

              {/* Visual Demo Card */}
              <div className="relative mx-auto max-w-5xl rounded-2xl border border-border/40 bg-card/50 p-2 shadow-2xl backdrop-blur-sm sm:p-4">
                <div className="flex flex-col gap-4 overflow-hidden rounded-xl border border-border/30 bg-background/80 p-6 md:flex-row">
                  {/* Analysis Step */}
                  <div className="flex flex-1 flex-col items-start gap-4 border-b border-border/30 pb-6 text-left md:border-b-0 md:border-r md:pb-0 md:pr-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Search className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Analysis</h3>
                      <p className="text-sm text-muted-foreground">Reading dependencies, structure, and metadata.</p>
                    </div>
                    <div className="mt-2 w-full space-y-2">
                      <div className="h-2 w-full rounded-full bg-secondary/50 overflow-hidden">
                        <div className="h-full w-[65%] bg-primary animate-pulse" />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest">
                        <span>Scanning components...</span>
                        <span>65%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Generation Step */}
                  <div className="flex flex-1 flex-col items-start gap-4 border-b border-border/30 pb-6 text-left md:border-b-0 md:border-r md:pb-0 md:pr-6 md:pl-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">AI Generation</h3>
                      <p className="text-sm text-muted-foreground">Drafting features, installation, and usage guides.</p>
                    </div>
                    <div className="mt-2 w-full space-y-1">
                      <div className="h-3 w-3/4 rounded bg-muted/40" />
                      <div className="h-3 w-1/2 rounded bg-muted/40" />
                      <div className="h-3 w-2/3 rounded bg-muted/40" />
                    </div>
                  </div>

                  {/* Result Step */}
                  <div className="flex flex-1 flex-col items-start gap-4 pt-6 text-left md:pt-0 md:pl-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">README Score</h3>
                      <p className="text-sm text-muted-foreground">94/100 Health score with improvement tips.</p>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-primary">94</span>
                      <span className="text-sm text-muted-foreground">/100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-24 bg-secondary/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Everything you need for perfect docs</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">Professional features built for developers who care about documentation quality.</p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Search,
                  title: "Repository Analysis",
                  description: "Automatic detection of technologies, dependencies, scripts, and project structure."
                },
                {
                  icon: Zap,
                  title: "AI README Generation",
                  description: "Accurate, context-aware documentation generation based on your actual codebase."
                },
                {
                  icon: Layout,
                  title: "GitHub Preview",
                  description: "Real-time, pixel-perfect preview that matches GitHub's actual CSS styling."
                },
                {
                  icon: BarChart3,
                  title: "README Health Score",
                  description: "Metric-driven evaluation of your documentation quality and completeness."
                },
                {
                  icon: ShieldCheck,
                  title: "Accuracy Checker",
                  description: "Verifies that your documentation facts match your technical reality."
                },
                {
                  icon: FileText,
                  title: "Professional Templates",
                  description: "Battle-tested templates for Open Source, SaaS, CLI tools, and more."
                }
              ].map((feature, i) => (
                <Card key={i} className="border-border/40 bg-background/50 transition-all hover:border-primary/30 hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 border border-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">How READMEForge Works</h2>
            </div>
            
            <div className="relative grid gap-12 md:grid-cols-4">
              {/* Connector lines for desktop */}
              <div className="absolute top-1/2 left-0 hidden h-0.5 w-full bg-border md:block -translate-y-12" />
              
              {[
                { step: "01", title: "Paste URL", desc: "Simply paste your public GitHub repository URL." },
                { step: "02", title: "Analyze", desc: "We scan your project's code, structure and metadata." },
                { step: "03", title: "Generate", desc: "AI creates a professional README tailored to your project." },
                { step: "04", title: "Export", desc: "Preview, improve with AI, and download your README.md." }
              ].map((item, i) => (
                <div key={i} className="relative flex flex-col items-center text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-background bg-primary text-xl font-bold text-primary-foreground shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-24 bg-secondary/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl rounded-2xl border border-border/40 bg-background overflow-hidden shadow-xl">
              <div className="grid md:grid-cols-2">
                <div className="p-8 md:border-r border-border/40">
                  <h3 className="mb-6 text-xl font-bold text-muted-foreground">Generic AI</h3>
                  <ul className="space-y-4">
                    {[
                      "Requires manually explaining project",
                      "Can invent non-existent features",
                      "No repository verification",
                      "Generic structure and tone"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-8 bg-primary/5">
                  <div className="mb-6 flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-bold">READMEForge</h3>
                  </div>
                  <ul className="space-y-4">
                    {[
                      "Reads repository metadata directly",
                      "Uses verified project information",
                      "Checks documentation health",
                      "Detects missing critical sections"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 border-t border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">Ready to forge a better README?</h2>
            <p className="mx-auto mb-10 max-w-2xl text-muted-foreground">Join thousands of developers using READMEForge to automate their documentation.</p>
            <Button size="lg" className="h-12 rounded-lg px-10 shadow-xl shadow-primary/20" asChild>
              <Link to="/auth">Get Started Now</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
                <Code2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">READMEForge</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 READMEForge. Built for developers by developers.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}