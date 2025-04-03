
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Auth callback initiated');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error in auth callback:', error);
          toast.error('Authentication failed');
          navigate('/auth');
          return;
        }

        if (!session) {
          console.error('No session found in callback');
          toast.error('Authentication failed - no session');
          navigate('/auth');
          return;
        }

        // Get the stored redirect path or default to dashboard
        const redirectPath = sessionStorage.getItem('authRedirectPath') || '/dashboard';
        sessionStorage.removeItem('authRedirectPath'); // Clean up

        console.log('Auth callback successful, redirecting to:', redirectPath);
        toast.success('Successfully signed in!');
        navigate(redirectPath);
      } catch (error) {
        console.error('Error handling auth callback:', error);
        toast.error('Authentication failed');
        navigate('/auth');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
        <h2 className="text-2xl font-bold mb-4">Finalizing sign in...</h2>
        <p className="text-muted-foreground">Please wait while we complete the authentication.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
