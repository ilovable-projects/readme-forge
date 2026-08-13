import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/auth/callback')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      type: (search['type'] as string) || 'auth',
    }
  },
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const type = search['type'];

  useEffect(() => {
    let mounted = true;
    let subscription: any = null;

    const handleAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          toast.error("Authentication failed. Please try again.");
          if (mounted) navigate({ to: '/auth' });
          return;
        }

        if (!mounted) return;

        if (type === 'recovery') {
          navigate({ to: '/auth' }); 
          toast.info("You can now reset your password");
          return;
        }

        if (session) {
          console.log("Session found, navigating to dashboard");
          navigate({ to: '/dashboard' });
          return;
        }

        // Only set up listener if no session exists yet
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return;
          console.log("Auth state change in callback:", event, !!session);
          if (session) {
            navigate({ to: '/dashboard' });
          } else if (event === 'SIGNED_OUT') {
            navigate({ to: '/auth' });
          }
        });
        subscription = data.subscription;
        
        // Timeout to prevent infinite loading if auth fails to resolve
        setTimeout(() => {
          if (mounted) {
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (!session && mounted) {
                console.warn("Auth timeout reached, no session found");
                navigate({ to: '/auth' });
              }
            });
          }
        }, 5000);
      } catch (err) {
        console.error("Unexpected error in auth callback:", err);
        if (mounted) navigate({ to: '/auth' });
      }
    };

    handleAuth();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [navigate, type]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">Authenticating...</p>
    </div>
  );
}
