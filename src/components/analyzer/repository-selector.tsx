import { useState, useMemo } from "react";
import { 
  Search, 
  Star, 
  Calendar, 
  Code, 
  Lock, 
  Unlock, 
  ArrowRight, 
  Filter,
  SortAsc,
  Loader2,
  RefreshCw,
  GithubIcon as Github
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { GitHubRepository } from "@/lib/github.functions";
import { formatDistanceToNow } from "date-fns";

interface RepositorySelectorProps {
  repositories: GitHubRepository[];
  onSelect: (url: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function RepositorySelector({ 
  repositories, 
  onSelect, 
  isLoading, 
  onRefresh 
}: RepositorySelectorProps) {
  const [search, setSearch] = useState("");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updated");

  const languages = useMemo(() => {
    const langs = new Set<string>();
    repositories.forEach(repo => {
      if (repo.language) langs.add(repo.language);
    });
    return Array.from(langs).sort();
  }, [repositories]);

  const filteredAndSortedRepos = useMemo(() => {
    let filtered = repositories.filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(search.toLowerCase()) || 
                          (repo.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesLanguage = languageFilter === "all" || repo.language === languageFilter;
      return matchesSearch && matchesLanguage;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "stars") {
        return b.stargazers_count - a.stargazers_count;
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [repositories, search, languageFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Fetching your GitHub repositories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search repositories..." 
            className="pl-10 bg-background/50 border-border/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger className="w-[140px] bg-background/50 border-border/50">
              <Filter className="h-3.5 w-3.5 mr-2" />
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {languages.map(lang => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] bg-background/50 border-border/50">
              <SortAsc className="h-3.5 w-3.5 mr-2" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Last Updated</SelectItem>
              <SelectItem value="stars">Most Stars</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={onRefresh} className="border-border/50">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3">
        {filteredAndSortedRepos.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border/50 rounded-xl bg-muted/5">
            <Github className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No repositories found matching your criteria.</p>
          </div>
        ) : (
          filteredAndSortedRepos.map((repo) => (
            <Card 
              key={repo.id} 
              className="group border-border/40 bg-card/40 hover:bg-card/80 hover:border-primary/30 transition-all cursor-pointer overflow-hidden"
              onClick={() => onSelect(repo.html_url)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold truncate text-foreground group-hover:text-primary transition-colors">
                        {repo.name}
                      </h4>
                      {repo.private ? (
                        <Badge variant="outline" className="text-[10px] h-4 bg-amber-500/5 text-amber-500 border-amber-500/20 px-1 font-normal">
                          <Lock className="h-2 w-2 mr-1" />
                          Private
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] h-4 bg-emerald-500/5 text-emerald-500 border-emerald-500/20 px-1 font-normal">
                          <Unlock className="h-2 w-2 mr-1" />
                          Public
                        </Badge>
                      )}
                    </div>
                    
                    {repo.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {repo.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 pt-1">
                      {repo.language && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <div className="h-2 w-2 rounded-full bg-primary/60" />
                          {repo.language}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3" />
                        {repo.stargazers_count}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Updated {formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                    <Button size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                      Analyze
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
