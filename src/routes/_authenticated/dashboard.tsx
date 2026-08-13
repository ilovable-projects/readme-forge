import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  Plus, 
  GitGraph, 
  Clock, 
  BarChart3, 
  FileText, 
  ChevronRight,
  Code2,
  Settings as SettingsIcon,
  Layout,
  Search,
  LogOut,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth, useRepositories } from "@/hooks/use-data";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
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
  const { user, loading: authLoading } = useAuth();
  const { data: repositories, isLoading: reposLoading } = useRepositories();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/auth' });
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-border/40 bg-card/30 backdrop-blur-xl hidden lg:block">
        <Link to="/dashboard" className="flex h-16 items-center gap-2 px-6 border-b border-border/40 hover:bg-secondary/20 transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Code2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">READMEForge</span>
        </Link>
        <nav className="p-4 space-y-2 flex flex-col h-[calc(100%-4rem)]">
          <div className="flex-1 space-y-2">
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
          </div>
          <Button variant="ghost" className="justify-start gap-3 px-3 text-muted-foreground hover:text-rose-400" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back, {user?.email?.split('@')[0]}</h1>
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
                <GitGraph className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{repositories?.length ?? 0}</div>
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
                <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">Ready to generate</p>
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
              {reposLoading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : repositories?.length === 0 ? (
                <div className="text-center p-12 border border-dashed border-border/40 rounded-xl bg-card/20">
                  <p className="text-muted-foreground">No repositories analyzed yet.</p>
                  <Button variant="link" asChild>
                    <Link to="/analyzer">Analyze your first repo →</Link>
                  </Button>
                </div>
              ) : repositories?.map((repo) => (
                <Card key={repo.id} className="bg-card/30 border-border/40 hover:border-primary/20 transition-all group">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                          <GitGraph className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold hover:underline cursor-pointer">{repo.owner} / {repo.name}</h3>
                            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest">{repo.language || 'Unknown'}</Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                             <span className="flex items-center gap-1">
                               <Clock className="h-3 w-3" />
                               {new Date(repo.updated_at).toLocaleDateString()}
                             </span>
                             <span className="flex items-center gap-1">
                               <BarChart3 className="h-3 w-3" />
                               {repo.stars?.toLocaleString() ?? 0} stars
                             </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <span className={`text-sm font-bold text-primary`}>Analyzed</span>
                          </div>
                          <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden">
                             <div className={`h-full bg-primary`} style={{ width: `100%` }} />
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                          <Link to="/editor" search={{ repositoryId: repo.id }}>
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
                 <CardTitle className="text-lg">Detected Technologies</CardTitle>
                 <CardDescription>Most common frameworks in your stack.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 {[
                   { name: "React", count: 8, color: "bg-blue-500" },
                   { name: "TypeScript", count: 12, color: "bg-sky-500" },
                   { name: "Node.js", count: 5, color: "bg-emerald-500" }
                 ].map((tech, i) => (
                   <div key={i} className="space-y-1">
                     <div className="flex justify-between text-xs">
                       <span className="font-medium">{tech.name}</span>
                       <span className="text-muted-foreground">{tech.count} repos</span>
                     </div>
                     <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                       <div className={`h-full ${tech.color}`} style={{ width: `${(tech.count / 15) * 100}%` }} />
                     </div>
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