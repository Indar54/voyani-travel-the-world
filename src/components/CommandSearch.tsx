
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Globe } from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { TravelGroup } from './TravelGroupCard';

// Fallback image for broken links
const fallbackImage = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop";

// Example state list - should be replaced with API data in production
const states = [
  'Rajasthan',
  'Kerala',
  'Himachal Pradesh',
  'Goa',
  'Tamil Nadu',
  'Maharashtra',
  'Karnataka',
  'Gujarat'
];

// Example world destinations - should be replaced with API data in production
const worldDestinations = [
  'France',
  'Italy',
  'Japan',
  'Thailand',
  'USA',
  'Australia'
];

interface CommandSearchProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CommandSearch: React.FC<CommandSearchProps> = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [travelGroups, setTravelGroups] = useState<TravelGroup[]>([]);

  // In a real app, this would fetch from an API
  useEffect(() => {
    // This would be replaced with an actual API call in production
    console.log("Search component mounted");
    // setTravelGroups(fetchedGroups)
  }, []);

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
        
        {travelGroups.length > 0 && (
          <CommandGroup heading="Travel Groups">
            {travelGroups
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
                      onError={(e) => {
                        console.log(`Group image failed to load: ${group.image}`);
                        (e.target as HTMLImageElement).src = fallbackImage;
                      }}
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
        )}
        
        <CommandGroup heading="Popular Destinations in India">
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

        <CommandSeparator />
        
        <CommandGroup heading="International Destinations">
          {worldDestinations
            .filter(country => country.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(country => (
              <CommandItem 
                key={country} 
                onSelect={() => navigate('/local-travel', { 
                  state: { isInternational: true } 
                })}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                <span>{country}</span>
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
