import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];
type GroupMessage = Tables['group_messages']['Row'] & {
  profiles: Tables['profiles']['Row'];
};

// Rate limiting variables
const MAX_MESSAGES_PER_MINUTE = 20;
const messageCountMap = new Map<string, number>();
const messageTimestampMap = new Map<string, number>();

// Reset message counts every minute
setInterval(() => {
  messageCountMap.clear();
  messageTimestampMap.clear();
}, 60000);

export const ChatController = {
  // Fetch messages for a group
  async fetchGroupMessages(groupId: string): Promise<GroupMessage[]> {
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching group messages:', error);
        throw error;
      }

      return data as GroupMessage[];
    } catch (error) {
      console.error('Error fetching group messages:', error);
      toast.error('Failed to load messages');
      return [];
    }
  },

  // Send a message with rate limiting
  async sendGroupMessage(groupId: string, userId: string, content: string) {
    if (!content.trim()) {
      return { success: false, error: 'Message cannot be empty' };
    }

    // Apply rate limiting
    const userKey = `${userId}-${groupId}`;
    const currentTimestamp = Date.now();
    const userMessageCount = messageCountMap.get(userKey) || 0;
    const lastMessageTimestamp = messageTimestampMap.get(userKey) || 0;

    // Check if user has exceeded message rate
    if (userMessageCount >= MAX_MESSAGES_PER_MINUTE) {
      const timeSinceFirstMessage = currentTimestamp - lastMessageTimestamp;

      // If less than a minute has passed, apply rate limit
      if (timeSinceFirstMessage < 60000) {
        toast.error('You are sending messages too quickly. Please wait a moment.');
        return { success: false, error: 'Rate limit exceeded' };
      } else {
        // Reset counter after a minute
        messageCountMap.set(userKey, 0);
      }
    }

    try {
      const { data, error } = await supabase
        .from('group_messages')
        .insert({
          content,
          group_id: groupId,
          sender_id: userId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update rate limiting trackers
      if (userMessageCount === 0) {
        messageTimestampMap.set(userKey, currentTimestamp);
      }
      messageCountMap.set(userKey, userMessageCount + 1);

      return { success: true, data };
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return { success: false, error };
    }
  },

  // Subscribe to real-time updates for messages
  subscribeToGroupMessages(groupId: string, callback: (payload: any) => void) {
    const channel = supabase.channel(`group_messages:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`
        },
        payload => {
          callback(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Delete a message (only allowed for message sender or group admin)
  async deleteMessage(messageId: string, userId: string) {
    try {
      // First get the message details
      const { data: message, error: fetchError } = await supabase
        .from('group_messages')
        .select(`
          *,
          travel_groups!inner (
            creator_id
          )
        `)
        .eq('id', messageId)
        .single();

      if (fetchError) throw fetchError;

      // Check if user is message sender or group creator
      const isMessageSender = (message as any).sender_id === userId;
      const isGroupCreator = (message as any).travel_groups && (message as any).travel_groups.creator_id === userId;

      if (!isMessageSender && !isGroupCreator) {
        throw new Error('Not authorized to delete this message');
      }

      // Delete the message
      const { error: deleteError } = await supabase
        .from('group_messages')
        .delete()
        .eq('id', messageId);

      if (deleteError) throw deleteError;

      return { success: true };
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
      return { success: false, error };
    }
  }
};

export default ChatController;
