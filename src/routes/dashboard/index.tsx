import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  Plus, 
  Github, 
  Clock, 
  BarChart3, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Code2,
  Settings as SettingsIcon,
  Layout,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

const RECENT_REPOS = [
  {
    id: "1",
    name: "react-query-auth",
    owner: "tanstack",
    url: "https://github.com/tanstack/react-query-auth",
    language: "TypeScript",
    score: 94,
    lastAnalyzed: "2 hours ago",
    stars: 1200
  },
  {
    id: "2",
    name: "shadcn-ui",
    owner: "shadcn",
    url: "https://github.com/shadcn-ui/ui",
    language: "TypeScript",
    score: 87,
    lastAnalyzed: "1 day ago",
    stars: 54300
  },
  {
    id: "3",
    name: "readme-forge",
    owner: "raheelnadeem",
    url: "https://github.com/raheelnadeem/readme-forge",
    language: "TypeScript",
    score: 62,
    lastAnalyzed: "3 days ago",
    stars: 12
  }
];

function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-border/40 bg-card/30 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border/40">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Code2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">READMEForge</span>
        </div>
        <nav className="p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium transition-colors">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link to="/analyzer" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
            <Search className="h-4 w-4" />
            Analyzer
          </Link>
          <Link to="/templates" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
            <Layout className="h-4 w-4" />
            Templates
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
            <SettingsIcon className="h-4 w-4" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back, Developer</h1>
              <p className="text-muted-foreground">Manage your repository documentation and health scores.</p>
            </div>
            <Button className="rounded-lg shadow-lg shadow-primary/20" asChild>
              <Link to="/analyzer">
                <Plus className="mr-2 h-4 w-4" />
                Analyze New Repository
              </Link>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="bg-card/50 border-border/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Analyzed Repos</CardTitle>
                <Github className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Avg Health Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">81.4%</div>
                <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                   <div className="h-full bg-primary" style={{ width: '81%' }} />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">READMEs Created</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48</div>
                <p className="text-xs text-muted-foreground">8 drafted this week</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">AI Tokens Saved</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">14.2k</div>
                <p className="text-xs text-muted-foreground">Estimated $42.00 saved</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Repositories */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">Recent Repositories</h2>
              <Button variant="ghost" size="sm" className="text-muted-foreground">View all</Button>
            </div>
            <div className="grid gap-4">
              {RECENT_REPOS.map((repo) => (
                <Card key={repo.id} className="bg-card/30 border-border/40 hover:border-primary/20 transition-all group">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                          <Github className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold hover:underline cursor-pointer">{repo.owner} / {repo.name}</h3>
                            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest">{repo.language}</Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                             <span className="flex items-center gap-1">
                               <Clock className="h-3 w-3" />
                               {repo.lastAnalyzed}
                             </span>
                             <span className="flex items-center gap-1">
                               <BarChart3 className="h-3 w-3" />
                               {repo.stars.toLocaleString()} stars
                             </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-muted-foreground">Health</span>
                            <span className={`text-sm font-bold ${
                              repo.score > 90 ? 'text-emerald-400' : 
                              repo.score > 70 ? 'text-amber-400' : 
                              'text-rose-400'
                            }`}>{repo.score}%</span>
                          </div>
                          <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden">
                             <div className={`h-full ${
                               repo.score > 90 ? 'bg-emerald-400' : 
                               repo.score > 70 ? 'bg-amber-400' : 
                               'bg-rose-400'
                             }`} style={{ width: `${repo.score}%` }} />
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                          <Link to="/analyzer">
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions / Recent Activity */}
          <div className="grid gap-6 md:grid-cols-2">
             <Card className="bg-card/50 border-border/40">
               <CardHeader>
                 <CardTitle className="text-lg">Recent Documents</CardTitle>
                 <CardDescription>Recently generated README files.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 {[
                   { name: "README.md", repo: "react-query-auth", date: "2h ago" },
                   { name: "CONTRIBUTING.md", repo: "shadcn-ui", date: "1d ago" },
                   { name: "INSTALL.md", repo: "readme-forge", date: "3d ago" }
                 ].map((doc, i) => (
                   <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors group cursor-pointer">
                     <div className="flex items-center gap-3">
                       <FileText className="h-4 w-4 text-primary" />
                       <div>
                         <p className="text-sm font-medium">{doc.name}</p>
                         <p className="text-xs text-muted-foreground">{doc.repo}</p>
                       </div>
                     </div>
                     <span className="text-xs text-muted-foreground">{doc.date}</span>
                   </div>
                 ))}
               </CardContent>
             </Card>

             <Card className="bg-card/50 border-border/40">
               <CardHeader>
                 <CardTitle className="text-lg">Tips & Insights</CardTitle>
                 <CardDescription>Improve your repository presence.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm font-medium text-amber-200">Missing Contributing Guide</p>
                    <p className="text-xs text-amber-200/70 mt-1">"react-query-auth" doesn't have a contributing guide. This can discourage new contributors.</p>
                    <Button variant="link" className="h-auto p-0 text-amber-200 mt-2 text-xs">Generate now →</Button>
                  </div>
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-sm font-medium text-emerald-200">High Installation Score</p>
                    <p className="text-xs text-emerald-200/70 mt-1">Your installation instructions in "shadcn-ui" are very clear. Great job!</p>
                  </div>
               </CardContent>
             </Card>
          </div>
        </div>
      </main>
    </div>
  );
}