
import React from 'react';
import TravelGroupCard, { TravelGroup } from './TravelGroupCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Sample data
const featuredGroups: TravelGroup[] = [
  {
    id: '1',
    title: 'Beach Getaway in Bali',
    destination: 'Bali, Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    startDate: '2023-11-15',
    endDate: '2023-11-25',
    maxParticipants: 8,
    currentParticipants: 5,
    tags: ['Beach', 'Relaxation', 'Nightlife', 'Culture']
  },
  {
    id: '2',
    title: 'Tokyo Anime & Culture Tour',
    destination: 'Tokyo, Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    startDate: '2023-12-05',
    endDate: '2023-12-15',
    maxParticipants: 6,
    currentParticipants: 3,
    tags: ['Urban', 'Anime', 'Shopping', 'Food']
  },
  {
    id: '3',
    title: 'Hiking the Italian Alps',
    destination: 'Dolomites, Italy',
    image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=800&q=80',
    startDate: '2024-01-10',
    endDate: '2024-01-18',
    maxParticipants: 10,
    currentParticipants: 6,
    tags: ['Hiking', 'Mountains', 'Adventure', 'Nature']
  }
];

const FeaturedGroups: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Featured Travel Groups</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Join these popular trips planned by our community members
            </p>
          </div>
          <Button 
            variant="ghost" 
            className="items-center gap-2 hidden md:flex"
            onClick={() => navigate('/browse')}
          >
            View all groups
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredGroups.map((group, index) => (
            <div key={group.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <TravelGroupCard group={group} />
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Button 
            variant="outline" 
            className="md:hidden"
            onClick={() => navigate('/browse')}
          >
            View all groups
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedGroups;
