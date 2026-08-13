import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  ArrowLeft, 
  CheckCircle2, 
  ChevronRight,
  BarChart3,
  Search,
  Zap,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/health/")({
  component: HealthPage,
});

const CATEGORIES = [
  { name: "Overview", score: 95 },
  { name: "Features", score: 80 },
  { name: "Installation", score: 100 },
  { name: "Usage", score: 70 },
  { name: "Tech Stack", score: 90 },
  { name: "Project Structure", score: 85 },
  { name: "Testing", score: 60 },
  { name: "Accuracy", score: 100 }
];

const ISSUES = [
  { 
    severity: "critical", 
    title: "Missing License Information", 
    desc: "Your README doesn't specify a license. This is critical for open source projects to define how others can use your code.",
    fix: "Generate MIT License"
  },
  { 
    severity: "warning", 
    title: "Weak Usage Examples", 
    desc: "The usage section is quite brief. Adding more code examples or a step-by-step guide would improve developer experience.",
    fix: "Expand Usage Guide"
  },
  { 
    severity: "suggestion", 
    title: "Add Project Screenshots", 
    desc: "Visuals significantly increase engagement. We detected potential UI components - consider adding screenshots.",
    fix: "Suggest Screenshots"
  }
];

function HealthPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="sm" asChild>
                <Link to="/editor">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Editor
                </Link>
             </Button>
             <h1 className="text-3xl font-bold tracking-tight">README Health Report</h1>
          </div>
          <Badge variant="outline" className="px-3 py-1 text-xs uppercase font-bold tracking-widest bg-emerald-500/5 text-emerald-500 border-emerald-500/20">
            Scan Complete
          </Badge>
        </header>

        {/* Hero Score Card */}
        <Card className="border-border/40 bg-card/50 overflow-hidden">
          <div className="grid md:grid-cols-3">
             <div className="p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/40 bg-primary/5">
                <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Overall Health</span>
                <div className="relative flex items-center justify-center">
                   <svg className="h-40 w-40 transform -rotate-90">
                      <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-secondary" />
                      <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * 87) / 100} className="text-primary" />
                   </svg>
                   <div className="absolute flex flex-col items-center">
                      <span className="text-5xl font-extrabold tracking-tighter">87</span>
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">/ 100</span>
                   </div>
                </div>
             </div>
             
             <div className="col-span-2 p-8 space-y-6">
                <div>
                   <h3 className="text-xl font-bold mb-2">Excellent Documentation!</h3>
                   <p className="text-muted-foreground text-sm leading-relaxed">Your README is in the top 5% of projects we've analyzed. It covers most essential categories and provides a clear technical overview of the project.</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                   <div className="space-y-1">
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Readability</span>
                      <p className="text-lg font-bold">High</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">SEO</span>
                      <p className="text-lg font-bold">Optimal</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Factual</span>
                      <p className="text-lg font-bold">100%</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Tone</span>
                      <p className="text-lg font-bold">Professional</p>
                   </div>
                </div>
             </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
           {/* Detailed Categories */}
           <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold tracking-tight">Category Breakdown</h2>
              <div className="grid gap-4">
                 {CATEGORIES.map((cat, i) => (
                    <div key={i} className="p-4 rounded-xl border border-border/40 bg-card/30 flex items-center justify-between">
                       <div className="flex-1 space-y-2 pr-8">
                          <div className="flex justify-between text-sm mb-1">
                             <span className="font-bold">{cat.name}</span>
                             <span className="text-muted-foreground">{cat.score}%</span>
                          </div>
                          <Progress value={cat.score} className="h-1.5" />
                       </div>
                       <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary/50">
                          {cat.score >= 90 ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Issues Sidebar */}
           <div className="space-y-6">
              <h2 className="text-xl font-bold tracking-tight">Action Items</h2>
              <div className="space-y-4">
                 {ISSUES.map((issue, i) => (
                    <Card key={i} className={`border-l-4 ${
                       issue.severity === 'critical' ? 'border-l-rose-500' : 
                       issue.severity === 'warning' ? 'border-l-amber-500' : 
                       'border-l-blue-500'
                    } bg-card/50`}>
                       <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 mb-1">
                             {issue.severity === 'critical' ? <ShieldCheck className="h-4 w-4 text-rose-500" /> : 
                              issue.severity === 'warning' ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : 
                              <Info className="h-4 w-4 text-blue-500" />}
                             <span className={`text-[10px] uppercase font-bold tracking-widest ${
                                issue.severity === 'critical' ? 'text-rose-500' : 
                                issue.severity === 'warning' ? 'text-amber-500' : 
                                'text-blue-500'
                             }`}>{issue.severity}</span>
                          </div>
                          <CardTitle className="text-sm">{issue.title}</CardTitle>
                       </CardHeader>
                       <CardContent>
                          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{issue.desc}</p>
                          <Button variant="outline" size="sm" className="w-full text-xs h-8 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary">
                             <Zap className="mr-2 h-3 w-3" />
                             {issue.fix}
                          </Button>
                       </CardContent>
                    </Card>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
