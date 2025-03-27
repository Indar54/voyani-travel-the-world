
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin } from 'lucide-react';

interface DestinationSelectionProps {
  state: string;
  onSelectDestination: (destination: string) => void;
}

// Map of state to destinations
const destinationsByState: Record<string, Array<{ name: string; image: string; activeGroups: number }>> = {
  'Rajasthan': [
    { name: 'Jaipur', image: 'https://images.unsplash.com/photo-1477586957327-847a0f3f4fe3?q=80&w=800&auto=format&fit=crop', activeGroups: 8 },
    { name: 'Udaipur', image: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?q=80&w=800&auto=format&fit=crop', activeGroups: 6 },
    { name: 'Jaisalmer', image: 'https://images.unsplash.com/photo-1639130698284-a8061cc014fb?q=80&w=800&auto=format&fit=crop', activeGroups: 4 },
    { name: 'Jodhpur', image: 'https://images.unsplash.com/photo-1591089398364-1a48ba3d12a3?q=80&w=800&auto=format&fit=crop', activeGroups: 5 },
    { name: 'Pushkar', image: 'https://images.unsplash.com/photo-1590076215667-78e809fa592f?q=80&w=800&auto=format&fit=crop', activeGroups: 3 },
    { name: 'Mount Abu', image: 'https://images.unsplash.com/photo-1630494969551-ee63a03c628a?q=80&w=800&auto=format&fit=crop', activeGroups: 2 }
  ],
  'Kerala': [
    { name: 'Munnar', image: 'https://images.unsplash.com/photo-1609948543931-5fd27be810e7?q=80&w=800&auto=format&fit=crop', activeGroups: 7 },
    { name: 'Alleppey', image: 'https://images.unsplash.com/photo-1608030609295-a06c6d730437?q=80&w=800&auto=format&fit=crop', activeGroups: 9 },
    { name: 'Kochi', image: 'https://images.unsplash.com/photo-1614851099511-773084f6911d?q=80&w=800&auto=format&fit=crop', activeGroups: 5 },
    { name: 'Wayanad', image: 'https://images.unsplash.com/photo-1609948543931-5fd27be810e7?q=80&w=800&auto=format&fit=crop', activeGroups: 4 },
    { name: 'Kovalam', image: 'https://images.unsplash.com/photo-1609357605129-26f047244131?q=80&w=800&auto=format&fit=crop', activeGroups: 3 }
  ],
  'Himachal Pradesh': [
    { name: 'Manali', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop', activeGroups: 12 },
    { name: 'Shimla', image: 'https://images.unsplash.com/photo-1599661046827-9a64bd68328d?q=80&w=800&auto=format&fit=crop', activeGroups: 8 },
    { name: 'Dharamshala', image: 'https://images.unsplash.com/photo-1592296429945-93008e7e7f92?q=80&w=800&auto=format&fit=crop', activeGroups: 6 },
    { name: 'Kasol', image: 'https://images.unsplash.com/photo-1588083949404-c4f1ed1323b3?q=80&w=800&auto=format&fit=crop', activeGroups: 7 },
    { name: 'Spiti Valley', image: 'https://images.unsplash.com/photo-1576058162500-c52afc501588?q=80&w=800&auto=format&fit=crop', activeGroups: 4 }
  ],
  'Goa': [
    { name: 'North Goa', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop', activeGroups: 15 },
    { name: 'South Goa', image: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?q=80&w=800&auto=format&fit=crop', activeGroups: 9 },
    { name: 'Panjim', image: 'https://images.unsplash.com/photo-1582117750092-088d508bb9df?q=80&w=800&auto=format&fit=crop', activeGroups: 5 },
    { name: 'Dudhsagar Falls', image: 'https://images.unsplash.com/photo-1625473721448-97a18b1d5a8d?q=80&w=800&auto=format&fit=crop', activeGroups: 4 }
  ],
  // Default destinations for any other state
  'default': [
    { name: 'Popular Destination 1', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800&auto=format&fit=crop', activeGroups: 5 },
    { name: 'Popular Destination 2', image: 'https://images.unsplash.com/photo-1482881497185-d4a9ddbe4151?q=80&w=800&auto=format&fit=crop', activeGroups: 3 },
    { name: 'Popular Destination 3', image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=800&auto=format&fit=crop', activeGroups: 4 },
    { name: 'Popular Destination 4', image: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?q=80&w=800&auto=format&fit=crop', activeGroups: 2 }
  ]
};

const DestinationSelection: React.FC<DestinationSelectionProps> = ({ state, onSelectDestination }) => {
  // Get destinations for the selected state, or fall back to default
  const destinations = destinationsByState[state] || destinationsByState.default;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">
        Popular Destinations in {state}
      </h2>
      <p className="text-muted-foreground max-w-2xl">
        Select a destination to create a travel group and find companions for your local adventure.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
        {destinations.map((destination, index) => (
          <Card 
            key={destination.name}
            className="overflow-hidden hover:scale-[1.02] transition-all cursor-pointer border border-gray-800"
            onClick={() => onSelectDestination(destination.name)}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="relative h-48 bg-gray-900">
              <img 
                src={destination.image} 
                alt={destination.name} 
                className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-lg font-semibold text-white">{destination.name}</h3>
                <div className="flex items-center text-gray-300 text-sm mt-1">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  <span>{destination.activeGroups} active groups</span>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{state}</span>
                </div>
                <Badge variant="outline" className="text-xs">Local Trip</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DestinationSelection;
