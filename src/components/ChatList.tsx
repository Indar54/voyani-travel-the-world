import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];
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

interface ChatListProps {
  chats: Chat[];
  activeChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
  isLoading: boolean;
}

export const ChatList = ({ chats, activeChat, onChatSelect, isLoading }: ChatListProps) => {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading chats...
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No chats found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <button
          key={chat.id}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
            activeChat?.id === chat.id
              ? 'bg-accent'
              : 'hover:bg-accent/50'
          }`}
          onClick={() => onChatSelect(chat)}
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src={chat.image} />
            <AvatarFallback>
              {chat.title.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h4 className="font-medium truncate">{chat.title}</h4>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                {formatDistanceToNow(new Date(chat.lastMessageTime), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {chat.lastMessage}
            </p>
          </div>

          {chat.unread > 0 && (
            <div className="bg-voyani-600 text-white text-xs font-medium rounded-full h-5 min-w-[20px] flex items-center justify-center">
              {chat.unread}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};
