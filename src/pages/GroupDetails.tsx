
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import TravelGroupDetails from '@/components/TravelGroupDetails';

// Sample data (same as in other components)
const groups = [
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
  },
  {
    id: '4',
    title: 'Safari Adventure in Kenya',
    destination: 'Maasai Mara, Kenya',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
    startDate: '2024-02-01',
    endDate: '2024-02-10',
    maxParticipants: 12,
    currentParticipants: 8,
    tags: ['Wildlife', 'Safari', 'Photography', 'Nature']
  },
  {
    id: '5',
    title: 'Exploring Ancient Ruins of Greece',
    destination: 'Athens, Greece',
    image: 'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?auto=format&fit=crop&w=800&q=80',
    startDate: '2024-03-15',
    endDate: '2024-03-25',
    maxParticipants: 8,
    currentParticipants: 2,
    tags: ['History', 'Culture', 'Architecture', 'Food']
  },
  {
    id: '6',
    title: 'Northern Lights in Iceland',
    destination: 'Reykjavik, Iceland',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80',
    startDate: '2024-01-20',
    endDate: '2024-01-28',
    maxParticipants: 6,
    currentParticipants: 4,
    tags: ['Northern Lights', 'Winter', 'Photography', 'Hot Springs']
  }
];

const GroupDetails = () => {
  const { id } = useParams<{ id: string }>();
  const group = groups.find(g => g.id === id);
  
  if (!group) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Travel Group Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The travel group you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <TravelGroupDetails group={group} />
    </Layout>
  );
};

export default GroupDetails;
