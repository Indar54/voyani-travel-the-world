
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatListProps {
  chats: any[];
  activeChat: any;
  onChatSelect: (chat: any) => void;
  isLoading: boolean;
}

const ChatList: React.FC<ChatListProps> = ({ 
  chats, 
  activeChat, 
  onChatSelect,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (chats.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground mb-2">No conversations yet</p>
        <p className="text-sm text-muted-foreground">
          Join or create travel groups to start chatting.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      {chats.map((chat) => (
        <Button
          key={chat.id}
          variant="ghost"
          className={`w-full justify-start py-6 px-4 h-auto ${
            activeChat?.id === chat.id 
              ? 'bg-accent' 
              : 'hover:bg-accent/50'
          }`}
          onClick={() => onChatSelect(chat)}
        >
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={chat.image} />
            <AvatarFallback>
              {chat.title.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <div className="flex justify-between w-full">
              <span className="font-semibold truncate max-w-[120px]">
                {chat.title}
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                {formatDistanceToNow(new Date(chat.lastMessageTime), { addSuffix: true })}
              </span>
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-[180px]">
              {chat.lastMessage}
            </span>
            {chat.unread > 0 && (
              <div className="bg-voyani-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-1">
                {chat.unread}
              </div>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
};

export default ChatList;
