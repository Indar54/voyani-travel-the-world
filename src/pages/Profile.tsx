import React from 'react';
import Layout from '@/components/Layout';
import ProfileSection from '@/components/ProfileSection';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const Profile = () => {
  const { profile } = useAuth();
  
  // Check if profile is incomplete
  const isProfileIncomplete = !profile?.full_name || !profile?.username || !profile?.location;
  
  return (
    <ProtectedRoute requireCompleteProfile={false}>
      <Layout>
        {isProfileIncomplete && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6 mx-4">
            <h2 className="text-lg font-semibold mb-2">Complete Your Profile</h2>
            <p className="text-muted-foreground">
              Please complete your profile information to access all features.
              {!profile?.full_name && " Add your full name."}
              {!profile?.username && " Choose a username."}
              {!profile?.location && " Set your location."}
            </p>
          </div>
        )}
        <ProfileSection 
          isOwnProfile={true} 
          profile={profile}
          forceEdit={isProfileIncomplete}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default Profile;
