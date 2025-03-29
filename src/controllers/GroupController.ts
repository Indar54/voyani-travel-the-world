
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

export interface GroupMember {
  id: string;
  profile: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    location: string | null;
  };
  status: string;
  joined_at: string;
}

export interface GroupWithMembers extends Tables<'travel_groups'> {
  members: GroupMember[];
  creator: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  tags: { id: string; tag: string }[];
  is_member: boolean;
  is_creator: boolean;
  member_status?: string;
}

export const GroupController = {
  async fetchGroups(filters: any = {}, userId?: string): Promise<GroupWithMembers[]> {
    try {
      let query = supabase
        .from('travel_groups')
        .select(`
          *,
          creator:profiles(id, username, full_name, avatar_url),
          tags:group_tags(id, tag)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.destination) {
        query = query.ilike('destination', `%${filters.destination}%`);
      }
      
      if (filters.startDate) {
        query = query.gte('start_date', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('end_date', filters.endDate);
      }
      
      if (filters.budget) {
        query = query.lte('budget_range', filters.budget);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Enhance groups with membership status if userId is provided
      let enhancedGroups = data as GroupWithMembers[];
      
      if (userId) {
        const { data: memberships, error: membershipError } = await supabase
          .from('group_members')
          .select('travel_group_id, status')
          .eq('profile_id', userId);
          
        if (membershipError) throw membershipError;
        
        const membershipMap = new Map();
        memberships?.forEach(membership => {
          membershipMap.set(membership.travel_group_id, membership.status);
        });
        
        enhancedGroups = enhancedGroups.map(group => ({
          ...group,
          is_member: membershipMap.has(group.id),
          is_creator: group.creator_id === userId,
          member_status: membershipMap.get(group.id) || null
        }));
      }

      return enhancedGroups;
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load travel groups');
      return [];
    }
  },

  async fetchGroupById(groupId: string, userId?: string): Promise<GroupWithMembers | null> {
    try {
      const { data, error } = await supabase
        .from('travel_groups')
        .select(`
          *,
          creator:profiles(id, username, full_name, avatar_url),
          tags:group_tags(id, tag)
        `)
        .eq('id', groupId)
        .single();

      if (error) throw error;

      const group = data as GroupWithMembers;
      
      // Add membership status if userId is provided
      if (userId) {
        const { data: membership, error: membershipError } = await supabase
          .from('group_members')
          .select('status')
          .eq('profile_id', userId)
          .eq('travel_group_id', groupId)
          .maybeSingle();
          
        if (membershipError) throw membershipError;
        
        group.is_member = !!membership;
        group.is_creator = group.creator_id === userId;
        group.member_status = membership?.status || null;
      }

      return group;
    } catch (error) {
      console.error('Error fetching group:', error);
      toast.error('Failed to load travel group details');
      return null;
    }
  },

  async fetchGroupMembers(groupId: string): Promise<{ members: GroupMember[], count: number }> {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          id,
          status,
          joined_at,
          profile:profiles(id, username, full_name, avatar_url, location)
        `)
        .eq('travel_group_id', groupId)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      const groupMembers = {
        members: data as GroupMember[],
        count: 0
      };
      
      // Get the count of members
      groupMembers.count = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('travel_group_id', groupId)
        .then(({ count }) => count || 0);

      return groupMembers;
    } catch (error) {
      console.error('Error fetching group members:', error);
      toast.error('Failed to load group members');
      return { members: [], count: 0 };
    }
  },

  async createGroup(groupData: any, userId: string): Promise<{ success: boolean, data?: any, error?: any }> {
    try {
      // First, insert the group
      const { data, error } = await supabase
        .from('travel_groups')
        .insert({
          title: groupData.title,
          description: groupData.description,
          destination: groupData.destination,
          start_date: groupData.startDate,
          end_date: groupData.endDate,
          budget_range: groupData.budget || null,
          max_participants: groupData.maxParticipants || null,
          image_url: groupData.imageUrl || null,
          creator_id: userId,
          current_participants: 1 // Creator is the first participant
        })
        .select()
        .single();

      if (error) throw error;

      // Add tags if provided
      if (groupData.tags && groupData.tags.length > 0) {
        const tagInserts = groupData.tags.map((tag: string) => ({
          travel_group_id: data.id,
          tag: tag.trim().toLowerCase()
        }));

        const { error: tagError } = await supabase
          .from('group_tags')
          .insert(tagInserts);

        if (tagError) {
          console.error('Error adding tags:', tagError);
          // Continue even if tags fail
        }
      }

      // Add creator as a member automatically
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          travel_group_id: data.id,
          profile_id: userId,
          status: 'accepted'
        });

      if (memberError) {
        console.error('Error adding creator as member:', memberError);
        // Continue even if this fails
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create travel group');
      return { success: false, error };
    }
  },

  async updateGroup(groupId: string, groupData: any, userId: string): Promise<{ success: boolean, data?: any, error?: any }> {
    try {
      // Check if user is the creator
      const { data: group, error: fetchError } = await supabase
        .from('travel_groups')
        .select('creator_id')
        .eq('id', groupId)
        .single();

      if (fetchError) throw fetchError;

      if (group.creator_id !== userId) {
        return { 
          success: false, 
          error: 'Only the group creator can update the group' 
        };
      }

      // Update the group
      const { data, error } = await supabase
        .from('travel_groups')
        .update({
          title: groupData.title,
          description: groupData.description,
          destination: groupData.destination,
          start_date: groupData.startDate,
          end_date: groupData.endDate,
          budget_range: groupData.budget || null,
          max_participants: groupData.maxParticipants || null,
          image_url: groupData.imageUrl || null
        })
        .eq('id', groupId)
        .select()
        .single();

      if (error) throw error;

      // Handle tags if provided
      if (groupData.tags) {
        // First delete existing tags
        const { error: deleteError } = await supabase
          .from('group_tags')
          .delete()
          .eq('travel_group_id', groupId);

        if (deleteError) {
          console.error('Error deleting existing tags:', deleteError);
          // Continue even if this fails
        }

        // Then add new tags
        if (groupData.tags.length > 0) {
          const tagInserts = groupData.tags.map((tag: string) => ({
            travel_group_id: groupId,
            tag: tag.trim().toLowerCase()
          }));

          const { error: tagError } = await supabase
            .from('group_tags')
            .insert(tagInserts);

          if (tagError) {
            console.error('Error adding new tags:', tagError);
            // Continue even if tags fail
          }
        }
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Failed to update travel group');
      return { success: false, error };
    }
  },

  async deleteGroup(groupId: string, userId: string): Promise<{ success: boolean, error?: any }> {
    try {
      // Check if user is the creator
      const { data: group, error: fetchError } = await supabase
        .from('travel_groups')
        .select('creator_id')
        .eq('id', groupId)
        .single();

      if (fetchError) throw fetchError;

      if (group.creator_id !== userId) {
        return { 
          success: false, 
          error: 'Only the group creator can delete the group' 
        };
      }

      // Delete the group (cascade will handle related records)
      const { error } = await supabase
        .from('travel_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete travel group');
      return { success: false, error };
    }
  },

  async joinGroup(groupId: string, userId: string): Promise<{ success: boolean, error?: any }> {
    try {
      // Check if already a member
      const { data: existingMember, error: checkError } = await supabase
        .from('group_members')
        .select('id, status')
        .eq('travel_group_id', groupId)
        .eq('profile_id', userId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingMember) {
        if (existingMember.status === 'accepted') {
          return { 
            success: false, 
            error: 'You are already a member of this group' 
          };
        } else if (existingMember.status === 'pending') {
          return { 
            success: false, 
            error: 'Your request to join is pending approval' 
          };
        } else if (existingMember.status === 'rejected') {
          // Update the rejected request to pending
          const { error: updateError } = await supabase
            .from('group_members')
            .update({ status: 'pending' })
            .eq('id', existingMember.id);

          if (updateError) throw updateError;
          return { success: true };
        }
      }

      // Check if group requires approval
      const { data: group, error: groupError } = await supabase
        .from('travel_groups')
        .select('max_participants, current_participants')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      // Check if group is full
      if (group.max_participants && group.current_participants >= group.max_participants) {
        return { 
          success: false, 
          error: 'This group is already at maximum capacity' 
        };
      }

      // Add member with pending status
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          travel_group_id: groupId,
          profile_id: userId,
          status: 'pending'
        });

      if (joinError) throw joinError;

      return { success: true };
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join travel group');
      return { success: false, error };
    }
  },

  async leaveGroup(groupId: string, userId: string): Promise<{ success: boolean, error?: any }> {
    try {
      // Check if user is the creator
      const { data: group, error: groupError } = await supabase
        .from('travel_groups')
        .select('creator_id')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      if (group.creator_id === userId) {
        return { 
          success: false, 
          error: 'As the creator, you cannot leave the group. You can delete it instead.' 
        };
      }

      // Remove the member
      const { error: leaveError } = await supabase
        .from('group_members')
        .delete()
        .eq('travel_group_id', groupId)
        .eq('profile_id', userId);

      if (leaveError) throw leaveError;

      // Update participant count
      const { error: updateError } = await supabase
        .from('travel_groups')
        .update({
          current_participants: supabase.rpc('decrement', { x: 1 })
        })
        .eq('id', groupId);

      if (updateError) {
        console.error('Error updating participant count:', updateError);
        // Continue even if this fails
      }

      return { success: true };
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave travel group');
      return { success: false, error };
    }
  },

  async approveJoinRequest(groupId: string, memberId: string, userId: string): Promise<{ success: boolean, error?: any }> {
    try {
      // Check if user is the creator
      const { data: group, error: groupError } = await supabase
        .from('travel_groups')
        .select('creator_id, max_participants, current_participants')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      if (group.creator_id !== userId) {
        return { 
          success: false, 
          error: 'Only the group creator can approve join requests' 
        };
      }

      // Check if group is full
      if (group.max_participants && group.current_participants >= group.max_participants) {
        return { 
          success: false, 
          error: 'This group is already at maximum capacity' 
        };
      }

      // Approve the request
      const { error: approveError } = await supabase
        .from('group_members')
        .update({ status: 'accepted' })
        .eq('travel_group_id', groupId)
        .eq('profile_id', memberId);

      if (approveError) throw approveError;

      // Update participant count
      const { error: updateError } = await supabase
        .from('travel_groups')
        .update({
          current_participants: supabase.rpc('increment', { x: 1 })
        })
        .eq('id', groupId);

      if (updateError) {
        console.error('Error updating participant count:', updateError);
        // Continue even if this fails
      }

      return { success: true };
    } catch (error) {
      console.error('Error approving join request:', error);
      toast.error('Failed to approve join request');
      return { success: false, error };
    }
  },

  async rejectJoinRequest(groupId: string, memberId: string, userId: string): Promise<{ success: boolean, error?: any }> {
    try {
      // Check if user is the creator
      const { data: group, error: groupError } = await supabase
        .from('travel_groups')
        .select('creator_id')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      if (group.creator_id !== userId) {
        return { 
          success: false, 
          error: 'Only the group creator can reject join requests' 
        };
      }

      // Reject the request
      const { error: rejectError } = await supabase
        .from('group_members')
        .update({ status: 'rejected' })
        .eq('travel_group_id', groupId)
        .eq('profile_id', memberId);

      if (rejectError) throw rejectError;

      return { success: true };
    } catch (error) {
      console.error('Error rejecting join request:', error);
      toast.error('Failed to reject join request');
      return { success: false, error };
    }
  },

  async removeMember(groupId: string, memberId: string, userId: string): Promise<{ success: boolean, error?: any }> {
    try {
      // Check if user is the creator
      const { data: group, error: groupError } = await supabase
        .from('travel_groups')
        .select('creator_id')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      if (group.creator_id !== userId) {
        return { 
          success: false, 
          error: 'Only the group creator can remove members' 
        };
      }

      // Cannot remove the creator
      if (memberId === group.creator_id) {
        return { 
          success: false, 
          error: 'Cannot remove the group creator' 
        };
      }

      // Remove the member
      const { error: removeError } = await supabase
        .from('group_members')
        .delete()
        .eq('travel_group_id', groupId)
        .eq('profile_id', memberId);

      if (removeError) throw removeError;

      // Update participant count
      const { error: updateError } = await supabase
        .from('travel_groups')
        .update({
          current_participants: supabase.rpc('decrement', { x: 1 })
        })
        .eq('id', groupId);

      if (updateError) {
        console.error('Error updating participant count:', updateError);
        // Continue even if this fails
      }

      return { success: true };
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
      return { success: false, error };
    }
  }
};

export default GroupController;
