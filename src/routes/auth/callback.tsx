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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!mounted) return;

      if (type === 'recovery') {
        navigate({ to: '/auth' }); 
        toast.info("You can now reset your password");
        return;
      }

      if (session) {
        navigate({ to: '/dashboard' });
      } else {
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return;
          if (session) {
            navigate({ to: '/dashboard' });
          } else if (event === 'SIGNED_OUT') {
            navigate({ to: '/auth' });
          }
        });
        subscription = data.subscription;
        
        setTimeout(() => {
          if (mounted && !session) {
            navigate({ to: '/auth' });
          }
        }, 10000);
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
