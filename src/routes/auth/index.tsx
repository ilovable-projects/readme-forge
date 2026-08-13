import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitGraph, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/auth/')({
  component: AuthPage,
});

function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate({ to: '/dashboard' });
      }
    });
  }, [navigate]);

  const handleEmailAuth = async (type: 'login' | 'signup') => {
    setIsLoading(true);
    try {
      const { error } = type === 'login' 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (error) throw error;

      if (type === 'signup') {
        toast.success('Check your email to confirm your account!');
      } else {
        toast.success('Successfully logged in!');
        navigate({ to: '/dashboard' });
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      
      <Card className="w-full max-w-md border-border/40 bg-card/50 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">READMEForge</CardTitle>
          <CardDescription>Enter your details to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <div className="mt-6 space-y-4">
              <Button 
                variant="outline" 
                className="w-full border-border/50 bg-background/50"
                onClick={handleGithubLogin}
              >
                <GitGraph className="mr-2 h-4 w-4" />
                Continue with GitHub
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/40" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                </div>
              </div>

              <form 
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  handleEmailAuth(activeTab as 'login' | 'signup'); 
                }} 
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50 focus:ring-primary/30"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50 focus:ring-primary/30"
                    required
                  />
                </div>
                
                <TabsContent value="login" className="mt-4 space-y-4">
                  <Button 
                    type="submit"
                    className="w-full shadow-lg shadow-primary/20" 
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                    Sign In
                  </Button>
                </TabsContent>
                
                <TabsContent value="signup" className="mt-4">
                  <Button 
                    type="submit"
                    className="w-full shadow-lg shadow-primary/20" 
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                    Create Account
                  </Button>
                </TabsContent>
              </form>

              {activeTab === 'login' && (
                <Button
                  variant="link"
                  className="w-full text-xs text-muted-foreground hover:text-primary transition-colors"
                  onClick={async () => {
                    if (!email) {
                      toast.error("Please enter your email address first.");
                      return;
                    }
                    const { error } = await supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: window.location.origin + '/auth/reset-password',
                    });
                    if (error) toast.error(error.message);
                    else toast.success("Password reset email sent!");
                  }}
                >
                  Forgot password?
                </Button>
              )}
            </div>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/40 pt-6">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
