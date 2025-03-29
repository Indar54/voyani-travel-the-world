
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ExtendedTables } from '@/utils/database-types';

// Rate limiting variables
const MAX_MESSAGES_PER_MINUTE = 20;
const messageCountMap = new Map<string, number>();
const messageTimestampMap = new Map<string, number>();

// Reset message counts every minute
setInterval(() => {
  messageCountMap.clear();
  messageTimestampMap.clear();
}, 60000);

interface GroupMessage {
  id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const ChatController = {
  // Fetch messages for a group
  async fetchGroupMessages(groupId: string): Promise<GroupMessage[]> {
    try {
      // Use RPC function to get messages
      const { data, error } = await supabase.rpc('get_group_messages', {
        p_group_id: groupId
      });

      // If the RPC isn't available yet, fallback to direct SQL query
      if (error) {
        console.log('Fallback to direct query:', error);
        
        // Use type assertion to avoid TypeScript errors
        const { data: rawData, error: queryError } = await supabase
          .from('group_messages' as any)
          .select(`
            id,
            content,
            created_at,
            sender:profiles!inner(id, username, full_name, avatar_url)
          `)
          .eq('travel_group_id', groupId)
          .order('created_at', { ascending: true });
          
        if (queryError) {
          console.error('Error fetching group messages:', queryError);
          throw queryError;
        }
        
        return (rawData || []) as GroupMessage[];
      }
      
      return (data || []) as GroupMessage[];
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
      // Use RPC call to insert message
      const { data, error } = await supabase.rpc('insert_group_message', {
        p_travel_group_id: groupId,
        p_sender_id: userId,
        p_content: content
      });
      
      if (error) {
        console.error('RPC Error sending message:', error);
        
        // Fall back to a direct insert if RPC isn't set up
        // Use type assertion to avoid TypeScript errors
        const { data: directData, error: directError } = await supabase
          .from('group_messages' as any)
          .insert({
            travel_group_id: groupId,
            sender_id: userId,
            content: content,
          })
          .select('id')
          .single();
          
        if (directError) throw directError;
        
        // Update rate limiting trackers
        if (userMessageCount === 0) {
          messageTimestampMap.set(userKey, currentTimestamp);
        }
        messageCountMap.set(userKey, userMessageCount + 1);
        
        return { success: true, data: directData };
      }
      
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
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'group_messages',
        filter: `travel_group_id=eq.${groupId}`
      }, payload => {
        callback(payload);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  },
  
  // Delete a message (only allowed for message sender or group admin)
  async deleteMessage(messageId: string, userId: string) {
    try {
      // First, verify the user can delete this message using an RPC
      const { data, error: fetchError } = await supabase.rpc('check_message_delete_permission', {
        p_message_id: messageId,
        p_user_id: userId
      });
      
      if (fetchError) {
        console.error('Error checking delete permission:', fetchError);
        
        // Fallback to manual verification if RPC isn't available
        // First get the message details using type assertion
        const { data: message, error: directFetchError } = await supabase
          .from('group_messages' as any)
          .select(`
            id, 
            sender_id, 
            travel_group_id
          `)
          .eq('id', messageId)
          .single();
          
        if (directFetchError) throw directFetchError;
        
        // Check if user is message sender
        const isMessageSender = message.sender_id === userId;
        
        // Check if user is group creator
        const { data: group, error: groupError } = await supabase
          .from('travel_groups')
          .select('creator_id')
          .eq('id', message.travel_group_id)
          .single();
          
        if (groupError) throw groupError;
        
        const isGroupCreator = group.creator_id === userId;
        
        if (!isMessageSender && !isGroupCreator) {
          return { success: false, error: 'You do not have permission to delete this message' };
        }
      } else if (!data) {
        return { success: false, error: 'You do not have permission to delete this message' };
      }
      
      // Delete the message using a direct delete operation with type assertion
      const { error: deleteError } = await supabase
        .from('group_messages' as any)
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
