
import React from 'react';
import Layout from '@/components/Layout';
import ProfileSection from '@/components/ProfileSection';

const Profile = () => {
  return (
    <Layout>
      <ProfileSection isOwnProfile={true} />
    </Layout>
  );
};

export default Profile;
