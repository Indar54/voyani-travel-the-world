
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  async fetchGroupMessages(groupId: string) {
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select(`
          id,
          content,
          created_at,
          sender:profiles(id, username, full_name, avatar_url)
        `)
        .eq('travel_group_id', groupId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      return data || [];
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
          travel_group_id: groupId,
          sender_id: userId,
          content: content,
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
    // This would normally use Supabase's realtime functionality
    // For now we'll return a dummy unsubscribe function
    return () => {};
  },
  
  // Delete a message (only allowed for message sender or group admin)
  async deleteMessage(messageId: string, userId: string) {
    try {
      // First, verify the user can delete this message
      const { data: message, error: fetchError } = await supabase
        .from('group_messages')
        .select(`
          id, 
          sender_id, 
          travel_group_id,
          travel_group:travel_groups(creator_id)
        `)
        .eq('id', messageId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Check if user is message sender or group creator
      const isMessageSender = message.sender_id === userId;
      const isGroupCreator = message.travel_group?.creator_id === userId;
      
      if (!isMessageSender && !isGroupCreator) {
        return { success: false, error: 'You do not have permission to delete this message' };
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
