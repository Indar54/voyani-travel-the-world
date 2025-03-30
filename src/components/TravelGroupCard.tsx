import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Crown, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export interface TravelGroup {
  id: string;
  title: string;
  destination: string;
  image: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  tags: string[];
  isCreator?: boolean;
}

export interface TravelGroupCardProps {
  group: TravelGroup;
}

const TravelGroupCard: React.FC<TravelGroupCardProps> = ({ group }) => {
  const [groupExists, setGroupExists] = useState(true);

  useEffect(() => {
    const checkGroup = async () => {
      if (!group?.id) return;

      const { data, error } = await supabase
        .from('travel_groups')
        .select('id')
        .eq('id', group.id)
        .single();

      if (error || !data) {
        setGroupExists(false);
      }
    };

    checkGroup();
  }, [group?.id]);

  // If group data is missing or invalid, show a placeholder card
  if (!group || !group.id || !groupExists) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">This group is no longer available</p>
            <p className="text-sm text-muted-foreground mt-2">
              The group may have been deleted or you may no longer have access to it.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link to={`/group/${group.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48">
          <img
            src={group.image}
            alt={group.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop';
            }}
          />
          {group.isCreator && (
            <Badge className="absolute top-2 right-2 bg-voyani-600">
              <Crown className="h-3 w-3 mr-1" />
              Created by you
            </Badge>
          )}
        </div>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-2">{group.title}</h3>
          <div className="flex items-center text-muted-foreground mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{group.destination}</span>
          </div>
          <div className="flex items-center text-muted-foreground mb-4">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              {new Date(group.startDate).toLocaleDateString()} - {new Date(group.endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              <span>{group.currentParticipants}/{group.maxParticipants} participants</span>
            </div>
            <div className="flex gap-2">
              {group.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TravelGroupCard;
