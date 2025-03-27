
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Calendar, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
}

interface TravelGroupCardProps {
  group: TravelGroup;
}

const TravelGroupCard: React.FC<TravelGroupCardProps> = ({ group }) => {
  // Format date display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const dateRange = `${formatDate(group.startDate)} - ${formatDate(group.endDate)}`;
  
  // Calculate days until trip
  const daysUntil = Math.ceil((new Date(group.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <Link to={`/group/${group.id}`}>
      <Card className="overflow-hidden hover-lift h-full bg-white border-white/60">
        <div className="aspect-w-16 aspect-h-9 relative">
          <img 
            src={group.image} 
            alt={group.title} 
            className="object-cover w-full h-48"
            loading="lazy"
          />
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-voyani-800 font-medium">
              {daysUntil > 0 ? `${daysUntil} days away` : "Ongoing"}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{group.title}</h3>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <MapPin className="h-4 w-4 mr-1 text-voyani-500" />
            <span>{group.destination}</span>
          </div>
          
          <div className="flex space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{dateRange}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{group.currentParticipants}/{group.maxParticipants}</span>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {group.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="bg-voyani-50/60 border-voyani-100 text-voyani-700 text-xs">
                {tag}
              </Badge>
            ))}
            {group.tags.length > 3 && (
              <Badge variant="outline" className="bg-muted/60 text-muted-foreground text-xs">
                +{group.tags.length - 3} more
              </Badge>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-5 pt-0 border-t border-border/50 flex justify-between items-center">
          <div className="flex -space-x-2">
            {[...Array(Math.min(3, group.currentParticipants))].map((_, i) => (
              <Avatar key={i} className="border-2 border-white h-8 w-8">
                <AvatarFallback className="bg-voyani-100 text-voyani-700 text-xs">
                  {String.fromCharCode(65 + i)}
                </AvatarFallback>
              </Avatar>
            ))}
            {group.currentParticipants > 3 && (
              <Avatar className="border-2 border-white h-8 w-8">
                <AvatarFallback className="bg-voyani-100 text-voyani-700 text-xs">
                  +{group.currentParticipants - 3}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <div className="text-voyani-600 flex items-center font-medium text-sm">
            View Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default TravelGroupCard;
