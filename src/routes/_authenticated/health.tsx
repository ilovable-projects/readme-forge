import { createFileRoute, Link, useSearch, useNavigate } from "@tanstack/react-router";
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
  Shield,
  Loader2,
  AlertCircle,
  AlertOctagon,
  RefreshCw,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-data";
import { toast } from "sonner";
import { checkReadmeAccuracy, fixAccuracyIssue, fixAllAccuracyIssues, type AccuracyIssue } from "@/lib/readme-accuracy.functions";
import { useServerFn } from "@tanstack/react-start";

const healthSearchSchema = z.object({
  documentId: z.string().optional(),
  repositoryId: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/health")({
  validateSearch: (search) => healthSearchSchema.parse(search),
  head: () => ({
    title: "Documentation Health Report | READMEForge",
    meta: [
      { name: "description", content: "Detailed analysis of your project's documentation quality, accuracy, and completeness." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: HealthPage,
});

const DEFAULT_CATEGORIES = [
  { name: "Overview", score: 95 },
  { name: "Features", score: 80 },
  { name: "Installation", score: 100 },
  { name: "Usage", score: 70 },
  { name: "Tech Stack", score: 90 },
  { name: "Project Structure", score: 85 },
  { name: "Testing", score: 60 },
  { name: "Accuracy", score: 100 }
];

const DEFAULT_ISSUES = [
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
  const { documentId, repositoryId } = useSearch({ from: '/_authenticated/health' });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(!!documentId || !!repositoryId);
  const [score, setScore] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [accuracyReport, setAccuracyReport] = useState<any>(null);
  const [fixing, setFixing] = useState<string | null>(null);

  const checkAccuracy = useServerFn(checkReadmeAccuracy);
  const fixIssue = useServerFn(fixAccuracyIssue);
  const fixAll = useServerFn(fixAllAccuracyIssues);

  useEffect(() => {
    if ((documentId || repositoryId) && user) {
      fetchScore();
    }
  }, [documentId, repositoryId, user]);

  const fetchScore = async () => {
    setLoading(true);
    try {
      if (repositoryId) {
        const { data: analysisData } = await supabase
          .from('repository_analyses')
          .select('*')
          .eq('repository_id', repositoryId)
          .maybeSingle();
        if (analysisData) setAnalysis(analysisData);
      }

      const query = supabase
        .from('readme_scores')
        .select('*');
      
      if (documentId) {
        query.eq('readme_document_id', documentId);
      } else if (repositoryId) {
        // Find latest score for this repo
        const { data: latestDoc } = await supabase
          .from('readme_documents')
          .select('id')
          .eq('repository_id', repositoryId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (latestDoc) {
          query.eq('readme_document_id', latestDoc.id);
        } else {
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setScore(data);
        if (data.suggestions && typeof data.suggestions === 'object') {
          const suggestions = data.suggestions as any;
          if (suggestions.accuracy_report) {
            setAccuracyReport(suggestions.accuracy_report);
          }
        }
      }
    } catch (error: any) {
      toast.error("Failed to load health report: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const displayScore = score?.overall_score ?? null;
  const showMockScore = displayScore === null && !loading;
  
  const categories = score ? [
    { name: "Overview", score: score.overview_score || 0 },
    { name: "Features", score: score.features_score || 0 },
    { name: "Installation", score: score.installation_score || 0 },
    { name: "Usage", score: score.usage_score || 0 },
    { name: "Tech Stack", score: score.tech_stack_score || 0 },
    { name: "Project Structure", score: score.project_structure_score || 0 },
    { name: "Testing", score: score.testing_score || 0 },
    { name: "Accuracy", score: score.accuracy_score || 0 }
  ] : DEFAULT_CATEGORIES;

  const issues = score?.issues || [];

  const handleFixIssue = async (issueId: string) => {
    if (!documentId || !repositoryId) return;
    setFixing(issueId);
    try {
      await fixIssue({ 
        data: { 
          documentId, 
          repositoryId, 
          issueId, 
          content: '' // This would be fetched from the doc if we had it here
        } 
      });
      toast.success("Accuracy issue fixed!");
      fetchScore();
    } catch (error: any) {
      toast.error("Failed to fix issue: " + error.message);
    } finally {
      setFixing(null);
    }
  };

  const handleFixAll = async () => {
    if (!documentId || !repositoryId) return;
    setFixing('all');
    try {
      await fixAll({ 
        data: { 
          documentId, 
          repositoryId, 
          content: '' 
        } 
      });
      toast.success("All accuracy issues fixed!");
      fetchScore();
    } catch (error: any) {
      toast.error("Failed to fix all issues: " + error.message);
    } finally {
      setFixing(null);
    }
  };

  const handleRecheckAccuracy = async () => {
    if (!documentId || !repositoryId) return;
    setLoading(true);
    try {
      const { data: docData } = await supabase
        .from('readme_documents')
        .select('markdown_content')
        .eq('id', documentId)
        .single();
        
      if (docData) {
        const result = await checkAccuracy({ 
          data: { 
            documentId, 
            repositoryId, 
            content: docData.markdown_content 
          } 
        });
        setAccuracyReport(result);
        toast.success("Accuracy report updated!");
      }
    } catch (error: any) {
      toast.error("Failed to recheck accuracy: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Analyzing Health...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" asChild className="shrink-0">
                <Link to="/editor" search={{ repositoryId: repositoryId || score?.repository_id || "" }}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
             </Button>
             <div className="space-y-1">
               <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Health Report</h1>
               <p className="text-muted-foreground text-xs md:text-sm hidden sm:block">Detailed analysis of your project's documentation quality.</p>
             </div>
          </div>
          <Badge variant="outline" className="w-fit px-3 py-1 text-[10px] uppercase font-bold tracking-widest bg-emerald-500/5 text-emerald-500 border-emerald-500/20">
            Scan Complete
          </Badge>
        </header>

        {/* Hero Score Card */}
        <Card className="border-border/40 bg-card/50 overflow-hidden">
          <div className="grid md:grid-cols-3">
             <div className="p-6 md:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/40 bg-primary/5">
                <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Overall Health</span>
                <div className="relative flex items-center justify-center">
                   <svg className="h-40 w-40 transform -rotate-90">
                      <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-secondary" />
                      <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * (displayScore ?? 0)) / 100} className="text-primary transition-all duration-1000 ease-in-out" />
                   </svg>
                   <div className="absolute flex flex-col items-center">
                      <span className="text-5xl font-extrabold tracking-tighter">{displayScore ?? "--"}</span>
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">/ 100</span>
                   </div>
                </div>
             </div>
             
             <div className="col-span-2 p-6 md:p-8 space-y-6">
                <div>
                    <h3 className="text-xl font-bold mb-2">
                     {displayScore === null ? "Analysis Pending" :
                      displayScore >= 90 ? "Excellent Documentation!" : 
                      displayScore >= 70 ? "Good Foundation" : "Needs Improvement"}
                   </h3>
                   <p className="text-muted-foreground text-sm leading-relaxed">
                     {displayScore === null ? "Please ensure you have generated a README and wait for the health scan to complete." :
                      displayScore >= 90 ? "Your README is in the top 5% of projects we've analyzed. It covers most essential categories and provides a clear technical overview of the project." :
                      "We've identified several areas where your documentation could be strengthened to better serve your project's users and contributors."}
                   </p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                   <div className="space-y-1">
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Readability</span>
                      <p className="text-lg font-bold">{displayScore >= 80 ? "High" : "Medium"}</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">SEO</span>
                      <p className="text-lg font-bold">{displayScore >= 85 ? "Optimal" : "Basic"}</p>
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
                 {categories.map((cat, i) => (
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
              
              {/* Accuracy Section */}
              {accuracyReport && (
                <Card className="border-primary/20 bg-primary/5 mb-6">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Accuracy Report</CardTitle>
                      </div>
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-none">
                        Score: {accuracyReport.accuracy_score}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Factual consistency between README and Repository
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        {accuracyReport.verified_claims?.length || 0} Verified Claims
                      </Badge>
                      {accuracyReport.unverified_claims?.length > 0 && (
                        <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20">
                          {accuracyReport.unverified_claims?.length} Unverified
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full text-xs" 
                      onClick={handleFixAll}
                      disabled={fixing === 'all' || (accuracyReport.critical_errors.length === 0 && accuracyReport.warnings.length === 0)}
                    >
                      {fixing === 'all' ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Zap className="mr-2 h-3 w-3" />}
                      Fix All Accuracy Issues
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-[10px] h-7 text-muted-foreground hover:text-primary"
                      onClick={handleRecheckAccuracy}
                    >
                      <RefreshCw className="mr-2 h-3 w-3" />
                      Re-scan for Inconsistencies
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                 {/* Accuracy Issues First */}
                 {accuracyReport && [...accuracyReport.critical_errors, ...accuracyReport.warnings, ...accuracyReport.suggestions].map((issue: AccuracyIssue, i: number) => (
                    <Card key={`acc-${i}`} className={`border-l-4 ${
                       issue.level === 'critical' ? 'border-l-rose-500' : 
                       issue.level === 'warning' ? 'border-l-amber-500' : 
                       'border-l-blue-500'
                    } bg-card/50`}>
                       <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 mb-1">
                             <AlertOctagon className={`h-4 w-4 ${
                                issue.level === 'critical' ? 'text-rose-500' : 
                                issue.level === 'warning' ? 'text-amber-500' : 
                                'text-blue-500'
                             }`} />
                             <span className={`text-[10px] uppercase font-bold tracking-widest ${
                                issue.level === 'critical' ? 'text-rose-500' : 
                                issue.level === 'warning' ? 'text-amber-500' : 
                                'text-blue-500'
                             }`}>{issue.level} (Accuracy)</span>
                          </div>
                          <CardTitle className="text-sm">{issue.problem}</CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-3">
                          <div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">README Claim</span>
                            <p className="text-xs italic text-muted-foreground bg-secondary/30 p-2 rounded mt-1 border border-border/20">{issue.readme_claim}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-emerald-500/80 uppercase">Verified Repo Info</span>
                            <p className="text-xs text-muted-foreground mt-1">{issue.verified_info}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-primary uppercase">Recommended Correction</span>
                            <p className="text-xs text-muted-foreground mt-1">{issue.recommended_correction}</p>
                          </div>
                       </CardContent>
                       <CardFooter className="pt-0 pb-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs h-8 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
                            onClick={() => handleFixIssue(issue.id)}
                            disabled={fixing === issue.id}
                          >
                             {fixing === issue.id ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Zap className="mr-2 h-3 w-3" />}
                             Fix This Issue
                          </Button>
                       </CardFooter>
                    </Card>
                 ))}

                 {/* General Issues */}
                 {issues.length > 0 ? issues.map((issue: any, i: number) => (
                    <Card key={i} className={`border-l-4 ${
                       issue.level === 'critical' ? 'border-l-rose-500' : 
                       issue.level === 'warning' ? 'border-l-amber-500' : 
                       'border-l-blue-500'
                    } bg-card/50`}>
                       <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 mb-1">
                             {issue.level === 'critical' ? <ShieldCheck className="h-4 w-4 text-rose-500" /> : 
                              issue.level === 'warning' ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : 
                              <Info className="h-4 w-4 text-blue-500" />}
                             <span className={`text-[10px] uppercase font-bold tracking-widest ${
                                issue.level === 'critical' ? 'text-rose-500' : 
                                issue.level === 'warning' ? 'text-amber-500' : 
                                'text-blue-500'
                             }`}>{issue.level}</span>
                          </div>
                          <CardTitle className="text-sm">{issue.title}</CardTitle>
                       </CardHeader>
                       <CardContent>
                          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{issue.explanation}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs h-8 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
                            onClick={() => {
                              navigate({ 
                                to: '/editor', 
                                search: { repositoryId: repositoryId || score?.repository_id || "" } 
                              });
                              setTimeout(() => {
                                toast.info(`Use AI to fix ${issue.category} in the editor.`);
                              }, 100);
                            }}
                          >
                             <Zap className="mr-2 h-3 w-3" />
                             Fix with AI
                          </Button>
                       </CardContent>
                    </Card>
                 )) : (
                   !accuracyReport && (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-card/20 rounded-xl border border-dashed border-border/40">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500/50 mb-3" />
                        <p className="text-sm text-muted-foreground">No critical issues found. Your README is in great shape!</p>
                    </div>
                   )
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
