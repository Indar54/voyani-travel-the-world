import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];
type Profile = Tables['profiles']['Row'];

interface ChatMessageProps {
  message: {
    id: string;
    text: string;
    timestamp: string;
    sender: {
      id: string;
      name: string;
      avatar: string | null;
    };
    isOwn: boolean;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {!message.isOwn && (
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={message.sender.avatar || undefined} />
            <AvatarFallback>
              {message.sender.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div>
          {!message.isOwn && (
            <div className="text-xs text-muted-foreground mb-1 ml-1">
              {message.sender.name}
            </div>
          )}
          
          <div className={`py-2 px-3 rounded-lg ${
            message.isOwn 
              ? 'bg-voyani-500 text-white mr-2' 
              : 'bg-accent'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          </div>
          
          <div className={`text-xs text-muted-foreground mt-1 ${
            message.isOwn ? 'text-right mr-2' : 'ml-1'
          }`}>
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

