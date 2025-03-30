import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin } from 'lucide-react';

interface DestinationSelectionProps {
  state: string;
  onSelectDestination: (destination: string) => void;
  isWorldDestination?: boolean;
}

// Fallback image
const fallbackImage = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop";

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
  'Tamil Nadu': [
    { name: 'Chennai', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop', activeGroups: 7 },
    { name: 'Ooty', image: 'https://images.unsplash.com/photo-1622308644420-b20142dc993c?q=80&w=800&auto=format&fit=crop', activeGroups: 9 },
    { name: 'Kodaikanal', image: 'https://images.unsplash.com/photo-1579688801652-01c163c6a10a?q=80&w=800&auto=format&fit=crop', activeGroups: 6 },
    { name: 'Madurai', image: 'https://images.unsplash.com/photo-1621468635269-5678a183fd9a?q=80&w=800&auto=format&fit=crop', activeGroups: 4 }
  ],
  'Maharashtra': [
    { name: 'Mumbai', image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=800&auto=format&fit=crop', activeGroups: 12 },
    { name: 'Pune', image: 'https://images.unsplash.com/photo-1625135569676-177944a8efaa?q=80&w=800&auto=format&fit=crop', activeGroups: 9 },
    { name: 'Lonavala', image: 'https://images.unsplash.com/photo-1578301978069-45264734cddc?q=80&w=800&auto=format&fit=crop', activeGroups: 7 },
    { name: 'Aurangabad', image: 'https://images.unsplash.com/photo-1609507654548-3ab79e6f8f9a?q=80&w=800&auto=format&fit=crop', activeGroups: 4 }
  ],
  'Karnataka': [
    { name: 'Bangalore', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop', activeGroups: 10 },
    { name: 'Coorg', image: 'https://images.unsplash.com/photo-1630653416551-95a18e1b70af?q=80&w=800&auto=format&fit=crop', activeGroups: 8 },
    { name: 'Hampi', image: 'https://images.unsplash.com/photo-1568636803855-a91f80c2f149?q=80&w=800&auto=format&fit=crop', activeGroups: 5 },
    { name: 'Mysore', image: 'https://images.unsplash.com/photo-1599661046929-37c7ec5af3ba?q=80&w=800&auto=format&fit=crop', activeGroups: 6 }
  ],
  'Gujarat': [
    { name: 'Ahmedabad', image: 'https://plus.unsplash.com/premium_photo-1668806378952-f701310db3af?q=80&w=800&auto=format&fit=crop', activeGroups: 7 },
    { name: 'Kutch', image: 'https://images.unsplash.com/photo-1619637570274-2e6be5c63b08?q=80&w=800&auto=format&fit=crop', activeGroups: 6 },
    { name: 'Somnath', image: 'https://images.unsplash.com/photo-1569774309459-bf6eb7815de4?q=80&w=800&auto=format&fit=crop', activeGroups: 4 },
    { name: 'Dwarka', image: 'https://images.unsplash.com/photo-1592047791312-e335fa1bec5f?q=80&w=800&auto=format&fit=crop', activeGroups: 3 }
  ],
  'Uttarakhand': [
    { name: 'Rishikesh', image: 'https://images.unsplash.com/photo-1626014303757-6366ef55c4ab?q=80&w=800&auto=format&fit=crop', activeGroups: 9 },
    { name: 'Nainital', image: 'https://images.unsplash.com/photo-1591267770230-2979274857e1?q=80&w=800&auto=format&fit=crop', activeGroups: 7 },
    { name: 'Mussoorie', image: 'https://images.unsplash.com/photo-1580049906314-a284ee9d8553?q=80&w=800&auto=format&fit=crop', activeGroups: 6 },
    { name: 'Auli', image: 'https://images.unsplash.com/photo-1600091166971-7f9fadd2e6ce?q=80&w=800&auto=format&fit=crop', activeGroups: 5 }
  ],
  'Uttar Pradesh': [
    { name: 'Agra', image: 'https://images.unsplash.com/photo-1564507004663-b6dfb3c824d5?q=80&w=800&auto=format&fit=crop', activeGroups: 9 },
    { name: 'Varanasi', image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?q=80&w=800&auto=format&fit=crop', activeGroups: 10 },
    { name: 'Lucknow', image: 'https://images.unsplash.com/photo-1631517847416-5c56a9f3c10d?q=80&w=800&auto=format&fit=crop', activeGroups: 7 },
    { name: 'Prayagraj', image: 'https://images.unsplash.com/photo-1612255109595-ae1e8e13c661?q=80&w=800&auto=format&fit=crop', activeGroups: 5 }
  ],
  'West Bengal': [
    { name: 'Kolkata', image: 'https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800&auto=format&fit=crop', activeGroups: 8 },
    { name: 'Darjeeling', image: 'https://images.unsplash.com/photo-1544634076-82e80687d034?q=80&w=800&auto=format&fit=crop', activeGroups: 9 },
    { name: 'Sundarbans', image: 'https://images.unsplash.com/photo-1614441884165-f27c2a804f56?q=80&w=800&auto=format&fit=crop', activeGroups: 5 },
    { name: 'Digha', image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?q=80&w=800&auto=format&fit=crop', activeGroups: 4 }
  ],
  'Assam': [
    { name: 'Guwahati', image: 'https://images.unsplash.com/photo-1605177297800-fc53c10f6933?q=80&w=800&auto=format&fit=crop', activeGroups: 6 },
    { name: 'Kaziranga', image: 'https://images.unsplash.com/photo-1616690002178-a2a753d86809?q=80&w=800&auto=format&fit=crop', activeGroups: 5 },
    { name: 'Majuli', image: 'https://images.unsplash.com/photo-1588772201206-4fded5072d15?q=80&w=800&auto=format&fit=crop', activeGroups: 3 },
    { name: 'Tezpur', image: 'https://images.unsplash.com/photo-1605177297800-fc53c10f6933?q=80&w=800&auto=format&fit=crop', activeGroups: 2 }
  ],
  'Bihar': [
    { name: 'Patna', image: 'https://images.unsplash.com/photo-1588413453099-354bd4402a6e?q=80&w=800&auto=format&fit=crop', activeGroups: 5 },
    { name: 'Bodh Gaya', image: 'https://images.unsplash.com/photo-1620146854030-590a50491d25?q=80&w=800&auto=format&fit=crop', activeGroups: 7 },
    { name: 'Nalanda', image: 'https://images.unsplash.com/photo-1612255109595-ae1e8e13c661?q=80&w=800&auto=format&fit=crop', activeGroups: 4 },
    { name: 'Rajgir', image: 'https://images.unsplash.com/photo-1588413453099-354bd4402a6e?q=80&w=800&auto=format&fit=crop', activeGroups: 3 }
  ],
  'Madhya Pradesh': [
    { name: 'Bhopal', image: 'https://images.unsplash.com/photo-1595930266007-4bb2f45a6b32?q=80&w=800&auto=format&fit=crop', activeGroups: 6 },
    { name: 'Indore', image: 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?q=80&w=800&auto=format&fit=crop', activeGroups: 7 },
    { name: 'Khajuraho', image: 'https://images.unsplash.com/photo-1590597519333-b95f2d950902?q=80&w=800&auto=format&fit=crop', activeGroups: 5 },
    { name: 'Ujjain', image: 'https://images.unsplash.com/photo-1595930266007-4bb2f45a6b32?q=80&w=800&auto=format&fit=crop', activeGroups: 4 }
  ],
  'Odisha': [
    { name: 'Bhubaneswar', image: 'https://images.unsplash.com/photo-1606298855672-3efb63017be8?q=80&w=800&auto=format&fit=crop', activeGroups: 5 },
    { name: 'Puri', image: 'https://images.unsplash.com/photo-1598196333387-05ee3ba25915?q=80&w=800&auto=format&fit=crop', activeGroups: 8 },
    { name: 'Konark', image: 'https://images.unsplash.com/photo-1606298855672-3efb63017be8?q=80&w=800&auto=format&fit=crop', activeGroups: 4 },
    { name: 'Chilika Lake', image: 'https://images.unsplash.com/photo-1580119027439-703dc1a1f56f?q=80&w=800&auto=format&fit=crop', activeGroups: 3 }
  ],
  // World destinations
  'France': [
    { name: 'Paris', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop', activeGroups: 15 },
    { name: 'Nice', image: 'https://images.unsplash.com/photo-1533614767277-901a486a3035?q=80&w=800&auto=format&fit=crop', activeGroups: 8 },
    { name: 'Lyon', image: 'https://images.unsplash.com/photo-1569396116180-7fe0deb128ea?q=80&w=800&auto=format&fit=crop', activeGroups: 6 },
    { name: 'Marseille', image: 'https://images.unsplash.com/photo-1596395819057-e37660e266e9?q=80&w=800&auto=format&fit=crop', activeGroups: 5 }
  ],
  'Italy': [
    { name: 'Rome', image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=800&auto=format&fit=crop', activeGroups: 18 },
    { name: 'Venice', image: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=800&auto=format&fit=crop', activeGroups: 14 },
    { name: 'Florence', image: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?q=80&w=800&auto=format&fit=crop', activeGroups: 12 },
    { name: 'Milan', image: 'https://images.unsplash.com/photo-1610016302534-6f67f1c968d8?q=80&w=800&auto=format&fit=crop', activeGroups: 10 }
  ],
  'Japan': [
    { name: 'Tokyo', image: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?q=80&w=800&auto=format&fit=crop', activeGroups: 20 },
    { name: 'Kyoto', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop', activeGroups: 15 },
    { name: 'Osaka', image: 'https://images.unsplash.com/photo-1589452271712-64b8a66c7b71?q=80&w=800&auto=format&fit=crop', activeGroups: 10 },
    { name: 'Hokkaido', image: 'https://images.unsplash.com/photo-1611368933592-9a8e81be0107?q=80&w=800&auto=format&fit=crop', activeGroups: 8 }
  ],
  'Thailand': [
    { name: 'Bangkok', image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=800&auto=format&fit=crop', activeGroups: 16 },
    { name: 'Phuket', image: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?q=80&w=800&auto=format&fit=crop', activeGroups: 12 },
    { name: 'Chiang Mai', image: 'https://images.unsplash.com/photo-1574788175245-fefb1105a2a3?q=80&w=800&auto=format&fit=crop', activeGroups: 9 },
    { name: 'Pattaya', image: 'https://images.unsplash.com/photo-1575037803915-a1ea40e8675a?q=80&w=800&auto=format&fit=crop', activeGroups: 7 }
  ],
  'USA': [
    { name: 'New York', image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=800&auto=format&fit=crop', activeGroups: 25 },
    { name: 'Los Angeles', image: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?q=80&w=800&auto=format&fit=crop', activeGroups: 18 },
    { name: 'Las Vegas', image: 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?q=80&w=800&auto=format&fit=crop', activeGroups: 16 },
    { name: 'Miami', image: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?q=80&w=800&auto=format&fit=crop', activeGroups: 14 }
  ],
  // Default destinations for any other state/country
  'default': [
    { name: 'Popular Destination 1', image: fallbackImage, activeGroups: 5 },
    { name: 'Popular Destination 2', image: fallbackImage, activeGroups: 3 },
    { name: 'Popular Destination 3', image: fallbackImage, activeGroups: 4 },
    { name: 'Popular Destination 4', image: fallbackImage, activeGroups: 2 }
  ]
};

export const DestinationSelection = ({ state, onSelectDestination, isWorldDestination = false }: DestinationSelectionProps) => {
  // Get destinations for the selected state, or fall back to default
  const destinations = destinationsByState[state] || destinationsByState.default;
  const regionType = isWorldDestination ? "Country" : "State";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">
        Popular Destinations in {state}
      </h2>
      <p className="text-muted-foreground max-w-2xl">
        {isWorldDestination 
          ? "Select a destination to create a travel group and find companions for your international adventure."
          : "Select a destination to create a travel group and find companions for your local adventure."}
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
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = fallbackImage;
                }}
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
                <Badge variant="outline" className="text-xs">
                  {isWorldDestination ? 'International Trip' : 'Local Trip'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
