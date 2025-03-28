
import React from 'react';
import Layout from '@/components/Layout';
import ProfileSection from '@/components/ProfileSection';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

const Profile = () => {
  const { profile } = useAuth();
  
  return (
    <ProtectedRoute>
      <Layout>
        <ProfileSection 
          isOwnProfile={true} 
          profile={profile}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default Profile;
