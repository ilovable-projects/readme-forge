import { createFileRoute } from "@tanstack/react-router";
import { 
  User, 
  Settings as SettingsIcon, 
  GitGraph, 
  Cpu, 
  Bell, 
  Shield, 
  CreditCard,
  ExternalLink,
  ChevronRight,
  LogOut,
  Save,
  Moon,
  Zap,
  Bot,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth, useProfile } from "@/hooks/use-data";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      // bio is not in schema yet, but we'll use metadata for it if needed or just skip for now
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error("Failed to update profile: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account, integrations, and AI preferences.</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-card/50 border border-border/40 p-1">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Preferences
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <GitGraph className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="border-border/40 bg-card/50">
              <CardHeader>
                <CardTitle>Public Profile</CardTitle>
                <CardDescription>How you appear to other developers and on your generated documents.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 border-2 border-primary/20">
                    <AvatarImage src={profile?.avatar_url || "https://github.com/shadcn.png"} />
                    <AvatarFallback>{displayName?.slice(0, 2).toUpperCase() || "UN"}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">Change Avatar</Button>
                    <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 2MB.</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input 
                      id="name" 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-background/50" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" value={user?.email || ""} disabled className="bg-background/50 opacity-50 cursor-not-allowed" />
                  </div>
                  <div className="col-span-full space-y-2">
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Input 
                      id="bio" 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Software Engineer and Open Source Contributor" 
                      className="bg-background/50" 
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-border/40 pt-6">
                <Button className="ml-auto" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-rose-500/20 bg-rose-500/5">
              <CardHeader>
                <CardTitle className="text-rose-500">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions for your account.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Delete Account</p>
                    <p className="text-xs text-muted-foreground">Permanently remove all your data, repositories and README drafts.</p>
                  </div>
                  <Button variant="destructive" size="sm">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card className="border-border/40 bg-card/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                   <Bot className="h-5 w-5 text-primary" />
                   <CardTitle>AI Engine Configuration</CardTitle>
                </div>
                <CardDescription>Customize how the AI analyzes your code and generates content.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Auto-Detection</Label>
                    <p className="text-xs text-muted-foreground">Automatically scan for new tech stacks and dependencies on import.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Tone of Voice</Label>
                    <p className="text-xs text-muted-foreground">Set the default personality for your generated documentation.</p>
                  </div>
                  <div className="flex gap-2">
                     <Button variant="secondary" size="sm" className="text-xs">Professional</Button>
                     <Button variant="ghost" size="sm" className="text-xs">Friendly</Button>
                     <Button variant="ghost" size="sm" className="text-xs">Minimal</Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                   <Label className="text-sm font-medium">Knowledge Base Context</Label>
                   <p className="text-xs text-muted-foreground mb-4">Additional context files for the AI to prioritize (e.g., custom style guides).</p>
                   <div className="p-4 rounded-lg border border-dashed border-border/60 bg-background/30 flex flex-col items-center justify-center gap-2">
                      <Cpu className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-xs text-muted-foreground">Drop .md or .txt files here</p>
                   </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
             <div className="grid gap-6">
                <Card className="border-border/40 bg-card/50">
                   <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                               <GitGraph className="h-6 w-6" />
                            </div>
                            <div>
                               <p className="font-bold">GitHub</p>
                               <p className="text-xs text-muted-foreground">Connected to @{user?.email?.split('@')[0]}</p>
                            </div>
                         </div>
                         <Button variant="outline" size="sm">Disconnect</Button>
                      </div>
                   </CardContent>
                </Card>
                
                <Card className="border-border/40 bg-card/50 opacity-60">
                   <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                               <Zap className="h-6 w-6" />
                            </div>
                            <div>
                               <p className="font-bold text-muted-foreground">Discord (Coming Soon)</p>
                               <p className="text-xs text-muted-foreground">Sync health updates to your server.</p>
                            </div>
                         </div>
                         <Button variant="outline" size="sm" disabled>Connect</Button>
                      </div>
                   </CardContent>
                </Card>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
