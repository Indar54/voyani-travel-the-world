
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

interface StateSelectionProps {
  onSelectState: (state: string) => void;
  isWorldDestination?: boolean;
}

interface RegionData {
  name: string;
  image: string;
  destinations: number;
}

const StateSelection: React.FC<StateSelectionProps> = ({ onSelectState, isWorldDestination = false }) => {
  // Fallback image for broken links
  const fallbackImage = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop";
  
  // List of popular Indian states with images
  const indianStates: RegionData[] = [
    { 
      name: 'Rajasthan', 
      image: 'https://images.unsplash.com/photo-1631867675167-90a456a90863?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHJhamFzdGhhbnxlbnwwfHwwfHx8MA%3D%3D',
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
      image: 'https://plus.unsplash.com/premium_photo-1668806378952-f701310db3af?q=80&w=800&auto=format&fit=crop',
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
      image: 'https://images.unsplash.com/photo-1626516008114-7dd309103a35?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGFzc2FtfGVufDB8fDB8fHww',
      destinations: 12
    },
    { 
      name: 'Bihar', 
      image: 'https://images.unsplash.com/photo-1631984876480-f821262c2609?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YmloYXJ8ZW58MHx8MHx8fDA%3D',
      destinations: 10
    },
    { 
      name: 'Madhya Pradesh', 
      image: 'https://images.unsplash.com/photo-1608181017892-cc4a542570d5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1hZGh5YSUyMHByYWRlc2h8ZW58MHx8MHx8fDA%3D',
      destinations: 18
    },
    { 
      name: 'Odisha', 
      image: 'https://images.unsplash.com/photo-1606298855672-3efb63017be8?q=80&w=800&auto=format&fit=crop',
      destinations: 14
    },
    { 
      name: 'Andhra Pradesh', 
      image: 'https://images.unsplash.com/photo-1572333837703-3f5d7a24c714?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      destinations: 16
    },
    { 
      name: 'Telangana', 
      image: 'https://images.unsplash.com/photo-1621909321963-2276c9660298?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8dGVsYW5nYW5hfGVufDB8fDB8fHww',
      destinations: 12
    },
    { 
      name: 'Jharkhand', 
      image: 'https://media.istockphoto.com/id/1415368447/photo/patratu-valley-with-lush-greenery-and-scenic-views-of-hills-located-in-patratu-ranchi.jpg?s=612x612&w=0&k=20&c=DI61h0tsvXnbWuoeZTpMrB70ELM9iu_h2oJsRxawa4U=',
      destinations: 8
    },
    { 
      name: 'Chhattisgarh', 
      image: 'https://plus.unsplash.com/premium_photo-1691031429475-a18a2c89d83c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2hhdHRpc2dhcmh8ZW58MHx8MHx8fDA%3D',
      destinations: 9
    },
    { 
      name: 'Jammu & Kashmir', 
      image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8amFtbXUlMjBhbmQlMjBrYXNobWlyfGVufDB8fDB8fHww',
      destinations: 21
    }
  ];

  // List of world destinations
  const worldDestinations: RegionData[] = [
    { 
      name: 'France', 
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop',
      destinations: 35
    },
    { 
      name: 'Italy', 
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=800&auto=format&fit=crop',
      destinations: 42
    },
    { 
      name: 'Japan', 
      image: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?q=80&w=800&auto=format&fit=crop',
      destinations: 30
    },
    { 
      name: 'Thailand', 
      image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=800&auto=format&fit=crop',
      destinations: 28
    },
    { 
      name: 'USA', 
      image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=800&auto=format&fit=crop',
      destinations: 50
    },
    { 
      name: 'Australia', 
      image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=800&auto=format&fit=crop',
      destinations: 25
    },
    { 
      name: 'Brazil', 
      image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=800&auto=format&fit=crop',
      destinations: 22
    },
    { 
      name: 'Greece', 
      image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=800&auto=format&fit=crop',
      destinations: 18
    },
    { 
      name: 'Spain', 
      image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=800&auto=format&fit=crop',
      destinations: 30
    },
    { 
      name: 'United Kingdom', 
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop',
      destinations: 32
    },
    { 
      name: 'South Africa', 
      image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=800&auto=format&fit=crop',
      destinations: 15
    },
    { 
      name: 'Egypt', 
      image: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?q=80&w=800&auto=format&fit=crop',
      destinations: 12
    }
  ];

  const displayRegions = isWorldDestination ? worldDestinations : indianStates;
  const regionType = isWorldDestination ? "Country" : "State";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Select Your {regionType}</h2>
      <p className="text-muted-foreground max-w-2xl">
        {isWorldDestination 
          ? "Choose a country to find international travel destinations and connect with global travelers."
          : "Choose your state to find local travel destinations and connect with travelers in your region."}
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {displayRegions.map((region, index) => (
          <Card 
            key={region.name}
            className="overflow-hidden hover:scale-[1.02] transition-all cursor-pointer border border-gray-800"
            onClick={() => onSelectState(region.name)}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="relative h-40 bg-gray-900">
              <img 
                src={region.image} 
                alt={region.name} 
                className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                onError={(e) => {
                  console.log(`Region image failed to load: ${region.image}`);
                  (e.target as HTMLImageElement).src = fallbackImage;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-lg font-semibold text-white">{region.name}</h3>
                <div className="flex items-center text-gray-300 text-sm mt-1">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{region.destinations} destinations</span>
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
