
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { TravelGroup } from './TravelGroupCard';

// Sample data for search
const searchableGroups: TravelGroup[] = [
  {
    id: '1',
    title: 'Beach Getaway in Goa',
    destination: 'Goa, India',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop',
    startDate: '2023-11-15',
    endDate: '2023-11-25',
    maxParticipants: 8,
    currentParticipants: 5,
    tags: ['Beach', 'Relaxation', 'Nightlife', 'Culture']
  },
  {
    id: '2',
    title: 'Spiritual Retreat in Varanasi',
    destination: 'Varanasi, India',
    image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?q=80&w=800&auto=format&fit=crop',
    startDate: '2023-12-05',
    endDate: '2023-12-15',
    maxParticipants: 6,
    currentParticipants: 3,
    tags: ['Spiritual', 'Culture', 'History', 'Ganges']
  },
  {
    id: '3',
    title: 'Hiking in Manali',
    destination: 'Manali, India',
    image: 'https://images.unsplash.com/photo-1621561101499-83a06783bd59?q=80&w=800&auto=format&fit=crop',
    startDate: '2024-01-10',
    endDate: '2024-01-18',
    maxParticipants: 10,
    currentParticipants: 6,
    tags: ['Hiking', 'Mountains', 'Adventure', 'Nature']
  },
  {
    id: '4',
    title: 'Wildlife Safari in Ranthambore',
    destination: 'Rajasthan, India',
    image: 'https://images.unsplash.com/photo-1615031644648-282022864623?q=80&w=800&auto=format&fit=crop',
    startDate: '2024-02-01',
    endDate: '2024-02-10',
    maxParticipants: 12,
    currentParticipants: 8,
    tags: ['Wildlife', 'Safari', 'Photography', 'Nature']
  },
  {
    id: '5',
    title: 'Historical Tour of Delhi',
    destination: 'Delhi, India',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop',
    startDate: '2024-03-15',
    endDate: '2024-03-25',
    maxParticipants: 8,
    currentParticipants: 2,
    tags: ['History', 'Culture', 'Architecture', 'Food']
  },
  {
    id: '6',
    title: 'Backwaters of Kerala',
    destination: 'Kerala, India',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop',
    startDate: '2024-01-20',
    endDate: '2024-01-28',
    maxParticipants: 6,
    currentParticipants: 4,
    tags: ['Backwaters', 'Relaxation', 'Nature', 'Cuisine']
  }
];

const states = [
  'Rajasthan',
  'Kerala',
  'Himachal Pradesh',
  'Goa',
  'Tamil Nadu',
  'Maharashtra',
  'Karnataka',
  'Gujarat',
  'Uttarakhand',
  'Uttar Pradesh',
  'West Bengal',
  'Assam'
];

interface CommandSearchProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CommandSearch: React.FC<CommandSearchProps> = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  const handleSelect = (route: string) => {
    setOpen(false);
    navigate(route);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Search trips, destinations, activities..." 
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Travel Groups">
          {searchableGroups
            .filter(group => 
              group.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
              group.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
              group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            .map(group => (
              <CommandItem 
                key={group.id} 
                onSelect={() => handleSelect(`/group/${group.id}`)}
                className="flex items-center gap-2 py-2"
              >
                <div className="h-8 w-8 rounded overflow-hidden">
                  <img 
                    src={group.image} 
                    alt={group.title} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span>{group.title}</span>
                  <span className="text-xs text-muted-foreground">{group.destination}</span>
                </div>
              </CommandItem>
            ))
          }
        </CommandGroup>
        
        <CommandGroup heading="States for Local Travel">
          {states
            .filter(state => state.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(state => (
              <CommandItem 
                key={state} 
                onSelect={() => handleSelect('/local-travel')}
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                <span>{state}</span>
              </CommandItem>
            ))
          }
        </CommandGroup>
        
        <CommandGroup heading="Quick Links">
          <CommandItem onSelect={() => handleSelect('/browse')}>
            Browse All Trips
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/create-group')}>
            Create a Trip
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/auth')}>
            Sign In / Register
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandSearch;
