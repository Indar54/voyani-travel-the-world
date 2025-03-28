
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import TravelGroupDetails from '@/components/TravelGroupDetails';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const GroupDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!id) return;
      
      try {
        // Fetch group details
        const { data: groupData, error: groupError } = await supabase
          .from('travel_groups')
          .select(`
            *,
            creator:profiles(*),
            tags:group_tags(id, tag)
          `)
          .eq('id', id)
          .single();
          
        if (groupError) throw groupError;
        
        if (groupData) {
          // Fetch group members
          const { data: membersData, error: membersError } = await supabase
            .from('group_members')
            .select(`
              *,
              profile:profiles(*)
            `)
            .eq('travel_group_id', id)
            .eq('status', 'accepted');
            
          if (membersError) throw membersError;
          
          setGroup({
            ...groupData,
            tags: groupData.tags.map((t: any) => t.tag),
            members: membersData,
            currentParticipants: membersData.length,
          });
        }
      } catch (error) {
        console.error('Error fetching group details:', error);
        toast.error('Could not load travel group details');
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
