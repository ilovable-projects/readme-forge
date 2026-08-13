import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  Search, 
  ArrowRight, 
  Loader2, 
  Database, 
  Code, 
  Terminal, 
  ShieldCheck, 
  FileCheck,
  Zap,
  GithubIcon as Github
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth, useAnalyzeRepository } from "@/hooks/use-data";
import { toast } from "sonner";

export const Route = createFileRoute("/analyzer/")({
  component: AnalyzerPage,
});

const PROGRESS_STEPS = [
  { label: "Validating repository", value: 10 },
  { label: "Fetching repository metadata", value: 30 },
  { label: "Scanning file structure", value: 50 },
  { label: "Analyzing configuration", value: 70 },
  { label: "Detecting technologies", value: 85 },
  { label: "Analyzing documentation", value: 95 },
  { label: "Saving analysis", value: 100 },
];

function AnalyzerPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  const { user } = useAuth();
  const analyzeRepo = useAnalyzeRepository();
  const navigate = useNavigate();

  const startAnalysis = async () => {
    if (!repoUrl) {
      toast.error("Please enter a repository URL");
      return;
    }
    
    if (!repoUrl.includes("github.com")) {
      toast.error("Please enter a valid GitHub URL");
      return;
    }
    
    setAnalyzing(true);
    setProgress(0);
    setAnalysisResult(null);

    // Simulate progress while the real server function runs
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < PROGRESS_STEPS.length) {
        const step = PROGRESS_STEPS[stepIndex];
        if (step) {
          setCurrentStep(step.label);
          setProgress(prev => {
            if (prev < step.value) return prev + 2;
            stepIndex++;
            return prev;
          });
        }
      }
    }, 100);

    try {
      const repo = await analyzeRepo.mutateAsync(repoUrl);
      
      // Fetch the analysis we just created (in a real app we'd return it from the mutation)
      // For now we'll just show success and let the UI transition
      clearInterval(interval);
      setProgress(100);
      setCurrentStep("Analysis complete!");
      
      toast.success("Repository analyzed successfully!");
      
      // Give a moment for the user to see 100%
      setTimeout(() => {
        setAnalyzing(false);
        // We'll redirect to the editor with the new repo ID
        navigate({ to: '/editor', search: { repositoryId: repo.id } });
      }, 1000);

    } catch (error: any) {
      clearInterval(interval);
      toast.error(error.message || "Failed to analyze repository");
      setAnalyzing(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight">Repository Analyzer</h1>
          <p className="text-muted-foreground text-lg">
            Connect READMEForge to your public GitHub repository for a deep scan.
          </p>
        </div>

        <Card className="border-border/40 bg-card/50 shadow-lg shadow-black/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="https://github.com/username/repo" 
                  className="h-14 pl-10 border-border/50 text-lg bg-background/50 focus:bg-background"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={analyzing}
                  onKeyDown={(e) => e.key === 'Enter' && startAnalysis()}
                />
              </div>
              <Button size="lg" className="h-14 px-8 text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98]" onClick={startAnalysis} disabled={analyzing}>
                {analyzing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
                {analyzing ? "Analyzing..." : "Analyze Now"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {analyzing && (
          <Card className="border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    {currentStep}
                  </h3>
                  <p className="text-muted-foreground">This usually takes about 10-20 seconds...</p>
                </div>
                <span className="text-2xl font-mono font-bold text-primary">{progress}%</span>
              </div>
              
              <div className="relative h-3 w-full bg-primary/10 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {PROGRESS_STEPS.map((step) => (
                  <div 
                    key={step.label} 
                    className={`flex items-center gap-3 text-sm transition-colors duration-300 ${
                      progress >= step.value ? "text-primary font-medium" : "text-muted-foreground"
                    }`}
                  >
                    <div className={`h-2 w-2 rounded-full ${
                      progress >= step.value ? "bg-primary animate-pulse" : "bg-muted"
                    }`} />
                    {step.label}
                    {progress >= step.value && <FileCheck className="h-4 w-4 ml-auto" />}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {!analyzing && !analysisResult && (
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <FeatureCard 
              icon={ShieldCheck} 
              title="Secure Analysis" 
              description="We only access public metadata. Your private data remains safe and untouched."
            />
            <FeatureCard 
              icon={Zap} 
              title="Lightning Fast" 
              description="Proprietary scanning engine analyzes thousands of files in seconds."
            />
            <FeatureCard 
              icon={Code} 
              title="Deep Detection" 
              description="Recognizes over 100+ frameworks, libraries and complex project structures."
            />
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl border border-border/40 bg-card/30 space-y-3">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
