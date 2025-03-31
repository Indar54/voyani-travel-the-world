import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireCompleteProfile?: boolean;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireCompleteProfile = true 
}) => {
  const { session, isLoading, profile } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !session) {
      toast.error('You need to sign in to access this page');
    }
  }, [isLoading, session]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    // Store the current location to redirect back after auth
    sessionStorage.setItem('authRedirectPath', location.pathname);
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Check if profile is complete when required
  if (requireCompleteProfile) {
    const isProfileComplete = profile.full_name && 
                            profile.username && 
                            profile.location;

    if (!isProfileComplete && location.pathname !== '/profile') {
      toast.info('Please complete your profile to continue');
      return <Navigate to="/profile" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
