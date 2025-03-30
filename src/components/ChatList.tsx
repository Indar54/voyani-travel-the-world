import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: Profile;
}

interface ChatListProps {
  messages: Message[];
  currentUserId: string;
}

const ChatList: React.FC<ChatListProps> = ({ messages, currentUserId }) => {
  return (
    <ScrollArea className="h-[400px] px-4">
      <div className="space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.sender.id === currentUserId;
          
          return (
            <div
              key={message.id}
              className={`flex items-start gap-2.5 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.sender.avatar_url} />
                <AvatarFallback>
                  {message.sender.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className={`flex flex-col gap-1 ${isCurrentUser ? 'items-end' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {message.sender.full_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                <div
                  className={`rounded-lg px-3 py-2 max-w-[320px] ${
                    isCurrentUser
                      ? 'bg-voyani-600 text-white'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default ChatList;
