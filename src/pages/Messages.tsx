import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Send, Users, UserPlus, Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from '@/components/ChatMessage';
import { ChatList } from '@/components/ChatList';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];
type GroupMessage = Tables['group_messages']['Row'] & {
  profiles: Tables['profiles']['Row'];
};

type TravelGroup = Tables['travel_groups']['Row'] & {
  group_messages: Pick<Tables['group_messages']['Row'], 'content' | 'created_at'>[];
};

interface Chat {
  id: string;
  title: string;
  image: string;
  isGroup: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
}

interface ChatMessageType {
  id: string;
  text: string;
  timestamp: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
  isOwn: boolean;
}

export const Messages = () => {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserGroups();
    }
  }, [user]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages();
      const unsubscribe = subscribeToMessages();
      return () => {
        unsubscribe?.();
      };
    }
  }, [activeChat]);

  const fetchUserGroups = async () => {
    if (!user?.id) return;

    try {
      const { data: groups, error } = await supabase
        .from('travel_groups')
        .select(`
          *,
          group_messages (
            content,
            created_at
          )
        `)
        .eq('creator_id', user.id);

      if (error) throw error;

      if (!groups) return;

      const formattedChats: Chat[] = groups.map(group => ({
        id: group.id,
        title: group.title,
        image: group.image_url || '',
        isGroup: true,
        lastMessage: group.group_messages?.[0]?.content || 'No messages yet',
        lastMessageTime: group.group_messages?.[0]?.created_at || new Date().toISOString(),
        unread: 0
      }));

      setChats(formattedChats);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!activeChat) return;

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
        .eq('group_id', activeChat.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data) return;

      setMessages(data as GroupMessage[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!activeChat) return;

    const subscription = supabase
      .channel('group_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${activeChat.id}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat || !user) return;

    try {
      const { error } = await supabase
        .from('group_messages')
        .insert({
          content: newMessage,
          group_id: activeChat.id,
          sender_id: user.id,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8 h-[calc(100vh-180px)] animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Messages</h1>
              <p className="text-muted-foreground">Chat with your travel companions</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button variant="outline" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                New Chat
              </Button>
            </div>
          </div>
          
          <Card className="h-full">
            <CardContent className="p-0 flex h-full">
              <div className="w-full md:w-1/3 border-r">
                <Tabs defaultValue="groups">
                  <TabsList className="w-full">
                    <TabsTrigger value="groups" className="flex-1">
                      <Users className="h-4 w-4 mr-2" />
                      Groups
                    </TabsTrigger>
                    <TabsTrigger value="direct" className="flex-1">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Direct
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="p-3">
                    <div className="relative mb-3">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-8" placeholder="Search chats..." />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <TabsContent value="groups" className="m-0">
                    <ScrollArea className="h-[calc(100vh-345px)]">
                      <ChatList 
                        chats={chats}
                        activeChat={activeChat}
                        onChatSelect={setActiveChat}
                        isLoading={isLoading}
                      />
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="direct" className="m-0">
                    <div className="p-4 text-center">
                      <p className="text-muted-foreground mb-3">Direct messaging coming soon!</p>
                      <Button disabled className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Start New Conversation
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="hidden md:flex flex-col w-2/3 h-full">
                {activeChat ? (
                  <>
                    <div className="border-b p-4 flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={activeChat.image} />
                        <AvatarFallback>
                          {activeChat.title.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{activeChat.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {activeChat.isGroup ? 'Group Chat' : 'Direct Message'}
                        </p>
                      </div>
                    </div>
                    
                    <ScrollArea className="flex-grow px-4 py-4">
                      {messages.length > 0 ? (
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <ChatMessage
                              key={message.id}
                              message={{
                                id: message.id,
                                text: message.content,
                                timestamp: message.created_at,
                                sender: {
                                  id: message.profiles.id,
                                  name: message.profiles.full_name || 'Unknown',
                                  avatar: message.profiles.avatar_url
                                },
                                isOwn: message.sender_id === user?.id
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-center">
                          <div>
                            <p className="text-muted-foreground mb-2">No messages yet</p>
                            <p className="text-sm text-muted-foreground">
                              Start the conversation by sending a message.
                            </p>
                          </div>
                        </div>
                      )}
                    </ScrollArea>
                    
                    <div className="border-t p-4">
                      <div className="flex items-center">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message..."
                          className="flex-grow"
                        />
                        <Button 
                          onClick={handleSendMessage} 
                          disabled={!newMessage.trim()}
                          className="ml-2"
                          size="icon"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                      <p className="text-muted-foreground">
                        Choose a group or start a new conversation.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Messages;
