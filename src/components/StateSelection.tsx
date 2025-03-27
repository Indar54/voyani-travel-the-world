
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

interface StateSelectionProps {
  onSelectState: (state: string) => void;
}

interface StateData {
  name: string;
  image: string;
  destinations: number;
}

const StateSelection: React.FC<StateSelectionProps> = ({ onSelectState }) => {
  // List of popular Indian states with images
  const states: StateData[] = [
    { 
      name: 'Rajasthan', 
      image: 'https://images.unsplash.com/photo-1599661046827-9a64bd68328d?q=80&w=800&auto=format&fit=crop',
      destinations: 24
    },
    { 
      name: 'Kerala', 
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop',
      destinations: 18
    },
    { 
      name: 'Himachal Pradesh', 
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop',
      destinations: 22
    },
    { 
      name: 'Goa', 
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop',
      destinations: 14
    },
    { 
      name: 'Tamil Nadu', 
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop',
      destinations: 20
    },
    { 
      name: 'Maharashtra', 
      image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=800&auto=format&fit=crop',
      destinations: 26
    },
    { 
      name: 'Karnataka', 
      image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop',
      destinations: 16
    },
    { 
      name: 'Gujarat', 
      image: 'https://images.unsplash.com/photo-1527506528778-50d199a87059?q=80&w=800&auto=format&fit=crop',
      destinations: 15
    },
    { 
      name: 'Uttarakhand', 
      image: 'https://images.unsplash.com/photo-1626014303757-6366ef55c4ab?q=80&w=800&auto=format&fit=crop',
      destinations: 19
    },
    { 
      name: 'Uttar Pradesh', 
      image: 'https://images.unsplash.com/photo-1564507004663-b6dfb3c824d5?q=80&w=800&auto=format&fit=crop',
      destinations: 23
    },
    { 
      name: 'West Bengal', 
      image: 'https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800&auto=format&fit=crop',
      destinations: 17
    },
    { 
      name: 'Assam', 
      image: 'https://images.unsplash.com/photo-1563194549-32e22fc36372?q=80&w=800&auto=format&fit=crop',
      destinations: 12
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Select Your State</h2>
      <p className="text-muted-foreground max-w-2xl">
        Choose your state to find local travel destinations and connect with travelers in your region.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {states.map((state, index) => (
          <Card 
            key={state.name}
            className="overflow-hidden hover:scale-[1.02] transition-all cursor-pointer border border-gray-800"
            onClick={() => onSelectState(state.name)}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="relative h-40 bg-gray-900">
              <img 
                src={state.image} 
                alt={state.name} 
                className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-lg font-semibold text-white">{state.name}</h3>
                <div className="flex items-center text-gray-300 text-sm mt-1">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{state.destinations} destinations</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StateSelection;
