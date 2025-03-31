import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User, Provider } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setProfile(null);
        return;
      }

      setProfile(profileData);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, 'Session:', currentSession?.user?.id);
        
        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            if (currentSession?.user) {
              try {
                // Fetch profile immediately after auth state change
                const { data: profileData, error: profileError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', currentSession.user.id)
                  .single();

                if (profileError) {
                  console.error('Error fetching profile:', profileError);
                  // If profile doesn't exist, redirect to profile creation
                  if (profileError.code === 'PGRST116') {
                    // Create initial profile with basic data
                    const { data: newProfile, error: createError } = await supabase
                      .from('profiles')
                      .insert({
                        id: currentSession.user.id,
                        username: `user_${currentSession.user.id.slice(0, 8)}`,
                        full_name: currentSession.user.user_metadata.full_name || 'New User',
                        avatar_url: currentSession.user.user_metadata.avatar_url || '',
                        location: '',
                        bio: '',
                        travel_interests: [],
                        languages: [],
                        updated_at: new Date().toISOString()
                      })
                      .select()
                      .single();

                    if (createError) {
                      console.error('Error creating profile:', createError);
                      toast.error('Failed to create profile');
                      return;
                    }

                    console.log('Created initial profile:', newProfile);
                    setProfile(newProfile);
                    // Redirect to profile page for completion
                    toast.info('Please complete your profile to continue');
                    navigate('/profile');
                    return;
                  } else {
                    toast.error('Failed to fetch profile');
                    return;
                  }
                }

                console.log('Fetched existing profile:', profileData);
                setProfile(profileData);

                // Check if profile is complete
                const isProfileComplete = profileData.full_name && 
                                       profileData.username && 
                                       profileData.location;

                if (!isProfileComplete) {
                  toast.info('Please complete your profile to continue');
                  navigate('/profile');
                  return;
                }

                // If profile is complete, redirect to dashboard
                navigate('/dashboard');
              } catch (error) {
                console.error('Error in auth state change:', error);
                toast.error('An error occurred during authentication');
              }
            }
            break;

          case 'SIGNED_OUT':
            setSession(null);
            setUser(null);
            setProfile(null);
            navigate('/');
            break;
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const refreshProfile = async () => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error refreshing profile:', error);
          return;
        }

        setProfile(data);
      } catch (error) {
        console.error('Error in refreshProfile:', error);
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Signed in successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (authError) {
        console.error('Auth error:', authError);
        toast.error(authError.message);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user data returned from sign up');
      }

      console.log('Auth user created:', authData.user.id);

      // Check if email confirmation is required
      if (authData.session === null) {
        toast.info('Please check your email to confirm your account');
        navigate('/auth');
        return;
      }

      // The profile should be created automatically by the trigger
      // Let's verify it exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Profile verification error:', profileError);
        console.error('Error details:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        });
        toast.error('Failed to verify profile creation');
        throw profileError;
      }

      console.log('Profile verified:', profileData);
      setProfile(profileData);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    try {
      setIsLoading(true);
      console.log('Starting OAuth sign in with provider:', provider);
      
      // Store the current path to redirect back after auth
      const currentPath = window.location.pathname;
      const redirectPath = currentPath === '/auth' ? '/dashboard' : currentPath;
      sessionStorage.setItem('authRedirectPath', redirectPath);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('OAuth error:', error);
        toast.error(error.message);
        throw error;
      }

      if (!data) {
        console.error('No data returned from OAuth');
        toast.error('Authentication failed');
        return;
      }

      console.log('OAuth initiated successfully, redirecting...');
    } catch (error) {
      console.error(`Sign in with ${provider} error:`, error);
      toast.error(`Failed to sign in with ${provider}`);
      navigate('/auth');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Clear any stored redirect paths
      sessionStorage.removeItem('authRedirectPath');
      
      // Clear local state first
      setSession(null);
      setUser(null);
      setProfile(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error(error.message);
        throw error;
      }
      
      // Clear any remaining local storage items
      localStorage.removeItem('supabase.auth.token');
      
      toast.success('Signed out successfully');
      
      // Navigate last, after everything is cleared
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, try to force sign out
      setSession(null);
      setUser(null);
      setProfile(null);
      navigate('/auth', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      profile,
      isLoading, 
      signIn, 
      signUp, 
      signOut,
      signInWithProvider,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
