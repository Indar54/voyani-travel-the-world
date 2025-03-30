import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import TravelGroupDetails from '@/components/TravelGroupDetails';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { TravelGroup } from '@/components/TravelGroupCard';

const GroupDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<TravelGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchGroupDetails = async () => {
      console.log('Fetching group details for ID:', id);
      
      if (!id) {
        console.log('No ID provided');
        return;
      }
      
      try {
        // Fetch group details
        console.log('Fetching group data...');
        const { data: groupData, error: groupError } = await supabase
          .from('travel_groups')
          .select(`
            *,
            creator:profiles(*),
            tags:group_tags(id, tag)
          `)
          .eq('id', id)
          .single();
          
        if (groupError) {
          console.error('Error fetching group:', groupError);
          throw groupError;
        }
        
        console.log('Group data received:', groupData);
        
        if (!groupData) {
          console.log('No group data found');
          setGroup(null);
          return;
        }

        // Fetch group members
        console.log('Fetching group members...');
        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select(`
            *,
            profile:profiles(*)
          `)
          .eq('travel_group_id', id)
          .eq('status', 'accepted');
          
        if (membersError) {
          console.error('Error fetching members:', membersError);
          throw membersError;
        }
        
        console.log('Members data received:', membersData);

        // Transform the data to match the TravelGroup interface
        const transformedGroup: TravelGroup = {
          id: groupData.id,
          title: groupData.title,
          destination: groupData.destination,
          image: groupData.image_url || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop",
          startDate: groupData.start_date,
          endDate: groupData.end_date,
          maxParticipants: groupData.max_participants,
          currentParticipants: membersData?.length || 0,
          tags: groupData.tags?.map((t: any) => t.tag) || []
        };
        
        console.log('Transformed group data:', transformedGroup);
        
        // Validate required fields
        if (!transformedGroup.id || !transformedGroup.title || !transformedGroup.destination || 
            !transformedGroup.startDate || !transformedGroup.endDate || !transformedGroup.maxParticipants) {
          console.error('Missing required fields in transformed group:', transformedGroup);
          throw new Error('Missing required fields in group data');
        }
        
        setGroup(transformedGroup);
      } catch (error) {
        console.error('Error in fetchGroupDetails:', error);
        toast.error('Could not load travel group details');
        setGroup(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGroupDetails();
  }, [id]);
  
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
