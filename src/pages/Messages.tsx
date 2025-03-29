
import React, { useState, useEffect, useCallback } from 'react';
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
import ChatList from '@/components/ChatList';
import { supabase } from '@/integrations/supabase/client';
import ChatController from '@/controllers/ChatController';

const Messages = () => {
  const { user, profile } = useAuth();
  const [activeChat, setActiveChat] = useState<any>(null);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserGroups();
    }
  }, [user]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
      const unsubscribe = subscribeToMessages(activeChat.id);
      
      return () => {
        unsubscribe();
      };
    }
  }, [activeChat]);

  const fetchUserGroups = async () => {
    try {
      // Fetch groups created by or joined by the user
      const { data: createdGroups, error: createdError } = await supabase
        .from('travel_groups')
        .select(`
          id,
          title,
          image_url,
          creator:profiles(username, avatar_url),
          members:group_members!inner(profile_id, status)
        `)
        .eq('creator_id', user?.id)
        .eq('members.status', 'accepted')
        .order('updated_at', { ascending: false });
        
      if (createdError) throw createdError;
      
      // Fetch groups joined by the user
      const { data: joinedGroups, error: joinedError } = await supabase
        .from('travel_groups')
        .select(`
          id,
          title,
          image_url,
          creator:profiles(username, avatar_url),
          members:group_members!inner(profile_id, status)
        `)
        .eq('members.profile_id', user?.id)
        .eq('members.status', 'accepted')
        .neq('creator_id', user?.id)
        .order('updated_at', { ascending: false });
        
      if (joinedError) throw joinedError;
      
      const allGroups = [...createdGroups, ...joinedGroups].map(group => ({
        id: group.id,
        title: group.title,
        image: group.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop',
        isGroup: true,
        lastMessage: "No messages yet",
        lastMessageTime: new Date().toISOString(),
        unread: 0,
      }));
      
      setMyGroups(allGroups);
      setIsLoading(false);
      
      // Set the first group as active chat if there's no active chat
      if (allGroups.length > 0 && !activeChat) {
        setActiveChat(allGroups[0]);
      }
    } catch (error) {
      console.error('Error fetching user groups for chat:', error);
      setIsLoading(false);
    }
  };

  const subscribeToMessages = (groupId: string) => {
    return ChatController.subscribeToGroupMessages(groupId, (payload) => {
      // When a new message comes in, refresh the messages
      fetchMessages(groupId);
    });
  };

  const fetchMessages = async (groupId: string) => {
    try {
      const groupMessages = await ChatController.fetchGroupMessages(groupId);
      
      // Format messages for display
      const formattedMessages = groupMessages.map(msg => ({
        id: msg.id,
        text: msg.content,
        timestamp: msg.created_at,
        sender: {
          id: msg.sender.id,
          name: msg.sender.full_name || msg.sender.username || 'Unknown User',
          avatar: msg.sender.avatar_url,
        },
        isOwn: msg.sender.id === user?.id,
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat || !user) return;
    
    try {
      const result = await ChatController.sendGroupMessage(activeChat.id, user.id, newMessage);
      
      if (result.success) {
        // Clear input - no need to refetch, the subscription will handle that
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
                        chats={myGroups}
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
                            <ChatMessage key={message.id} message={message} />
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
                          onKeyDown={handleKeyPress}
                          placeholder="Type a message..."
                          className="flex-grow"
                        />
                        <Button 
                          onClick={sendMessage} 
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
