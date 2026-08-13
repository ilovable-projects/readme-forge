import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/auth/callback')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      type: (search.type as string) || 'auth',
    }
  },
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const { type } = Route.useSearch();

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (type === 'recovery') {
        navigate({ to: '/auth/index' }); // Actually needs a reset page, but for now redirect back to auth
        toast.info("You can now reset your password");
        return;
      }

      if (session) {
        navigate({ to: '/dashboard' });
      } else {
        // Handle cases where session might not be immediately available
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            navigate({ to: '/dashboard' });
            subscription.unsubscribe();
          } else if (event === 'SIGNED_OUT') {
            navigate({ to: '/auth' });
            subscription.unsubscribe();
          }
        });
        
        // Timeout to prevent infinite spinner
        const timeout = setTimeout(() => {
          subscription.unsubscribe();
          navigate({ to: '/auth' });
        }, 10000);

        return () => {
          clearTimeout(timeout);
          subscription.unsubscribe();
        };
      }
    };

    handleAuth();
  }, [navigate, type]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">Authenticating...</p>
    </div>
  );
}
