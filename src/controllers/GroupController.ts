import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];
type TravelGroupRow = Tables['travel_groups']['Row'];
type ProfileRow = Tables['profiles']['Row'];

export interface GroupMember {
  id: string;
  profile: ProfileRow;
  status: string;
  joined_at: string;
}

export interface TravelGroup extends TravelGroupRow {
  members: GroupMember[];
  creator: ProfileRow;
  is_member: boolean;
  is_creator: boolean;
  member_status?: string;
}

export const GroupController = {
  async fetchGroups(filters: any = {}, userId?: string): Promise<TravelGroup[]> {
    try {
      let query = supabase
        .from('travel_groups')
        .select(`
          *,
          creator:profiles!travel_groups_creator_id_fkey(*)
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

      const { data: rawData, error } = await query;

      if (error) throw error;

      // Transform raw data into TravelGroup format
      const groups = (rawData || []).map((group: any) => ({
        ...group,
        members: [],
        current_participants: group.current_participants ?? 0,
        is_member: false,
        is_creator: false,
        creator: group.creator as ProfileRow
      }));
      
      if (userId) {
        const { data: memberships, error: membershipError } = await supabase
          .from('group_members')
          .select('travel_group_id, status')
          .eq('profile_id', userId);
          
        if (membershipError) throw membershipError;
        
        const membershipMap = new Map(
          (memberships || []).map(m => [m.travel_group_id, m.status])
        );
        
        return groups.map(group => ({
          ...group,
          is_member: membershipMap.has(group.id),
          is_creator: group.creator_id === userId,
          member_status: membershipMap.get(group.id)
        }));
      }

      return groups;
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load travel groups');
      return [];
    }
  },

  async fetchGroupById(groupId: string, userId?: string): Promise<TravelGroup | null> {
    try {
      const { data: rawGroup, error } = await supabase
        .from('travel_groups')
        .select(`
          *,
          creator:profiles!travel_groups_creator_id_fkey(*)
        `)
        .eq('id', groupId)
        .single();

      if (error) throw error;

      const group: TravelGroup = {
        ...(rawGroup as any),
        members: [],
        current_participants: (rawGroup as any).current_participants ?? 0,
        is_member: false,
        is_creator: false,
        creator: (rawGroup as any).creator as ProfileRow
      };
      
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
        group.member_status = membership?.status;
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
      // First fetch group_member rows
      const { data: memberRows, error: membersError } = await supabase
        .from('group_members')
        .select('id, status, joined_at, profile_id')
        .eq('travel_group_id', groupId)
        .order('joined_at', { ascending: false });

      if (membersError) throw membersError;

      const profileIds = (memberRows || [])
        .map((m) => m.profile_id)
        .filter((id): id is string => Boolean(id));

      // Then fetch matching profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', profileIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      const members: GroupMember[] = (memberRows || []).map((m: any) => ({
        id: m.id,
        status: m.status,
        joined_at: m.joined_at,
        profile: profileMap.get(m.profile_id) as ProfileRow,
      }));

      // Count members accurately
      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('travel_group_id', groupId);

      return { members, count: count || 0 };
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
          creator_id: userId
        })
        .select()
        .single();

      if (error) throw error;

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
      // Update group data
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
      const { data: group } = await supabase
        .from('travel_groups')
        .select('max_participants')
        .eq('id', groupId)
        .single();

      const maxParticipants = group?.max_participants ?? 0;

      // Get count of existing accepted members
      const { count: acceptedCount } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('travel_group_id', groupId)
        .eq('status', 'accepted');

      if ((acceptedCount ?? 0) >= maxParticipants) {
        return { success: false, error: 'Group is full' };
      }

      // Get count of existing members
      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('travel_group_id', groupId);

      const memberCount = count ?? 0;

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
      toast.error('Failed to join group');
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

      return { success: true };
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave group');
      return { success: false, error };
    }
  },

  async approveJoinRequest(groupId: string, memberId: string, userId: string): Promise<{ success: boolean, error?: any }> {
    try {
      // Check if user is the creator and get current participants
      const { data: group, error: groupError } = await supabase
        .from('travel_groups')
        .select('creator_id, max_participants')
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
      const { count: acceptedCount } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('travel_group_id', groupId)
        .eq('status', 'accepted');

      if (group.max_participants && (acceptedCount ?? 0) >= group.max_participants) {
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
      // Check if user is the creator and get current participants
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

      return { success: true };
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
      return { success: false, error };
    }
  }
};

export default GroupController;
