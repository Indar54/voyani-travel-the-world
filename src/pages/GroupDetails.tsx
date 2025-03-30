import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import TravelGroupDetails from '@/components/TravelGroupDetails';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TravelGroup } from '@/components/TravelGroupCard';
import { useAuth } from '@/context/AuthContext';

const GroupDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<TravelGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchGroupDetails = async () => {
      console.log('Fetching group details for ID:', id);
      console.log('Current user:', user);
      
      if (!id) {
        console.log('No ID provided');
        return;
      }
      
      try {
        // Fetch group details with creator info
        console.log('Fetching group data...');
        const { data: groupData, error: groupError } = await supabase
          .from('travel_groups')
          .select('*')
          .eq('id', id)
          .single();
          
        if (groupError) {
          console.error('Error fetching group:', groupError);
          throw groupError;
        }
        
        console.log('Raw group data:', groupData);
        
        if (!groupData) {
          console.log('No group data found');
          setGroup(null);
          return;
        }

        // Fetch creator info
        console.log('Fetching creator info...');
        const { data: creatorData, error: creatorError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', groupData.creator_id)
          .single();
          
        if (creatorError) {
          console.error('Error fetching creator:', creatorError);
          // Don't throw, continue without creator info
        }
        
        console.log('Creator data:', creatorData);

        // Fetch tags
        console.log('Fetching tags...');
        const { data: tagsData, error: tagsError } = await supabase
          .from('group_tags')
          .select('tag')
          .eq('travel_group_id', id);
          
        if (tagsError) {
          console.error('Error fetching tags:', tagsError);
          // Don't throw, continue without tags
        }
        
        console.log('Tags data:', tagsData);

        // Fetch group members
        console.log('Fetching group members...');
        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select(`
            id,
            profile_id,
            status,
            profile:profiles (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('travel_group_id', id)
          .eq('status', 'accepted');
          
        if (membersError) {
          console.error('Error fetching members:', membersError);
          // Don't throw, continue without members
        }
        
        console.log('Members data:', membersData);

        // Transform the data to match the TravelGroup interface
        const transformedGroup: TravelGroup = {
          id: groupData.id,
          title: groupData.title,
          destination: groupData.destination,
          image: groupData.image_url || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop",
          startDate: groupData.start_date,
          endDate: groupData.end_date,
          maxParticipants: groupData.max_participants || 0,
          currentParticipants: membersData?.length || 0,
          tags: tagsData?.map(t => t.tag) || [],
          isCreator: user?.id === groupData.creator_id
        };
        
        console.log('Transformed group data:', transformedGroup);
        console.log('Is creator?', user?.id === groupData.creator_id);
        console.log('Creator check values:', {
          userId: user?.id,
          creatorId: groupData.creator_id,
          match: user?.id === groupData.creator_id
        });
        
        setGroup(transformedGroup);
      } catch (error: any) {
        console.error('Error in fetchGroupDetails:', error);
        toast.error(error.message || 'Could not load travel group details');
        setGroup(null);
        // Redirect to profile page after error
        navigate('/profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGroupDetails();
  }, [id, user?.id, navigate]);
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-300 rounded w-full max-w-2xl mb-6"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!group) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Travel Group Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The travel group you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <TravelGroupDetails group={group} />
    </Layout>
  );
};

export default GroupDetails;
