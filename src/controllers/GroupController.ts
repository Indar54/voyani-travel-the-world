import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Rate limiting variables for group actions
const MAX_GROUP_ACTIONS_PER_HOUR = 10;
const groupActionCountMap = new Map<string, number>();
const groupActionTimestampMap = new Map<string, number>();

// Reset group action counts every hour
setInterval(() => {
  groupActionCountMap.clear();
  groupActionTimestampMap.clear();
}, 3600000);

export const GroupController = {
  // Create a new travel group
  async createGroup(groupData: any) {
    try {
      // Apply rate limiting for group creation
      const userId = groupData.creator_id;
      const currentTimestamp = Date.now();
      const userActionCount = groupActionCountMap.get(userId) || 0;
      const lastActionTimestamp = groupActionTimestampMap.get(userId) || 0;
      
      // Check if user has exceeded group creation rate
      if (userActionCount >= MAX_GROUP_ACTIONS_PER_HOUR) {
        const timeSinceFirstAction = currentTimestamp - lastActionTimestamp;
        
        // If less than an hour has passed, apply rate limit
        if (timeSinceFirstAction < 3600000) {
          toast.error('You have created too many groups recently. Please try again later.');
          return { success: false, error: 'Rate limit exceeded' };
        } else {
          // Reset counter after an hour
          groupActionCountMap.set(userId, 0);
        }
      }
      
      // Create the travel group
      const { data, error } = await supabase
        .from('travel_groups')
        .insert(groupData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update rate limiting trackers
      if (userActionCount === 0) {
        groupActionTimestampMap.set(userId, currentTimestamp);
      }
      groupActionCountMap.set(userId, userActionCount + 1);
      
      return { success: true, data };
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create travel group');
      return { success: false, error };
    }
  },
  
  // Join a travel group
  async joinGroup(groupId: string, userId: string) {
    try {
      // Check if user is already a member
      const { data: existingMember, error: checkError } = await supabase
        .from('group_members')
        .select('id, status')
        .eq('travel_group_id', groupId)
        .eq('profile_id', userId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      // If already a member with accepted status, return early
      if (existingMember?.status === 'accepted') {
        toast.info('You are already a member of this group');
        return { success: true, alreadyMember: true };
      }
      
      // If pending, update the notification
      if (existingMember?.status === 'pending') {
        toast.info('Your request to join this group is pending');
        return { success: true, pending: true };
      }
      
      // Otherwise, create a new membership request
      const { data, error } = await supabase
        .from('group_members')
        .insert({
          travel_group_id: groupId,
          profile_id: userId,
          status: 'pending'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Request to join group sent');
      return { success: true, data };
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join travel group');
      return { success: false, error };
    }
  },
  
  // Approve or reject a join request
  async manageJoinRequest(requestId: string, status: 'accepted' | 'rejected', userId: string) {
    try {
      // First verify the user is the group creator
      const { data: request, error: fetchError } = await supabase
        .from('group_members')
        .select(`
          id,
          travel_group:travel_groups(id, creator_id, max_participants, current_participants)
        `)
        .eq('id', requestId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Check if user is the group creator
      if (request.travel_group.creator_id !== userId) {
        return { success: false, error: 'Only the group creator can manage join requests' };
      }
      
      // If accepting, check if group is full
      if (status === 'accepted') {
        const currentCount = request.travel_group.current_participants || 0;
        const maxCount = request.travel_group.max_participants || 10;
        
        if (currentCount >= maxCount) {
          return { success: false, error: 'This group is already at maximum capacity' };
        }
        
        // Update the current_participants count if accepting
        const { error: updateGroupError } = await supabase
          .from('travel_groups')
          .update({ current_participants: currentCount + 1 })
          .eq('id', request.travel_group.id);
          
        if (updateGroupError) throw updateGroupError;
      }
      
      // Update the request status
      const { data, error } = await supabase
        .from('group_members')
        .update({ status })
        .eq('id', requestId)
        .select()
        .single();
        
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Error managing join request:', error);
      toast.error('Failed to update join request');
      return { success: false, error };
    }
  },
  
  // Leave a group
  async leaveGroup(groupId: string, userId: string) {
    try {
      // Check if user is the group creator
      const { data: group, error: groupError } = await supabase
        .from('travel_groups')
        .select('creator_id')
        .eq('id', groupId)
        .single();
        
      if (groupError) throw groupError;
      
      // Creators can't leave their own groups, they need to delete them
      if (group.creator_id === userId) {
        toast.error('As the group creator, you cannot leave the group. You can delete it instead.');
        return { success: false, error: 'Creators cannot leave their own groups' };
      }
      
      // Delete the membership
      const { data: membership, error: fetchError } = await supabase
        .from('group_members')
        .select('id, status')
        .eq('travel_group_id', groupId)
        .eq('profile_id', userId)
        .maybeSingle();
        
      if (fetchError) throw fetchError;
      
      // If not a member, return early
      if (!membership) {
        return { success: false, error: 'You are not a member of this group' };
      }
      
      // Only reduce member count if status was accepted
      if (membership.status === 'accepted') {
        // Reduce the current_participants count
        const { error: updateGroupError } = await supabase
          .from('travel_groups')
          .update({ 
            current_participants: supabase.rpc('decrement', { x: 1 }) 
          })
          .eq('id', groupId);
          
        if (updateGroupError) throw updateGroupError;
      }
      
      // Delete the membership
      const { error: deleteError } = await supabase
        .from('group_members')
        .delete()
        .eq('id', membership.id);
        
      if (deleteError) throw deleteError;
      
      toast.success('You have left the group');
      return { success: true };
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave travel group');
      return { success: false, error };
    }
  },
  
  // Delete a group (only allowed for group creator)
  async deleteGroup(groupId: string, userId: string) {
    try {
      // Verify the user is the group creator
      const { data: group, error: groupError } = await supabase
        .from('travel_groups')
        .select('creator_id')
        .eq('id', groupId)
        .single();
        
      if (groupError) throw groupError;
      
      if (group.creator_id !== userId) {
        return { success: false, error: 'Only the group creator can delete the group' };
      }
      
      // Delete the group (will cascade delete memberships, messages, etc.)
      const { error: deleteError } = await supabase
        .from('travel_groups')
        .delete()
        .eq('id', groupId);
        
      if (deleteError) throw deleteError;
      
      toast.success('Group has been deleted');
      return { success: true };
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete travel group');
      return { success: false, error };
    }
  }
};

export default GroupController;
