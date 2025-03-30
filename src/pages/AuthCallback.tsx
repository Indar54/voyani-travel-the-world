import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error in auth callback:', error);
          toast.error('Authentication failed');
          navigate('/auth');
          return;
        }

        if (session) {
          toast.success('Email confirmed successfully!');
          navigate('/dashboard');
        } else {
          toast.error('No session found');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        toast.error('Authentication failed');
        navigate('/auth');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Confirming your email...</h2>
        <p className="text-muted-foreground">Please wait while we verify your account.</p>
      </div>
    </div>
  );
};

export default AuthCallback; 