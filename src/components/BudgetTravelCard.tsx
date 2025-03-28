
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, Users, MapPin, Wallet } from 'lucide-react';
import { format } from 'date-fns';

interface BudgetTravelCardProps {
  trip: any;
}

const BudgetTravelCard: React.FC<BudgetTravelCardProps> = ({ trip }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
          src={trip.image} 
          alt={trip.title} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-green-600 hover:bg-green-700">Budget-Friendly</Badge>
        </div>
        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-xs flex items-center">
          <Wallet className="h-3 w-3 mr-1" />
          ₹{trip.budget.toLocaleString()}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="font-bold truncate">{trip.title}</h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{trip.destination}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 my-2">
          {trip.tags.slice(0, 3).map((tag: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {trip.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{trip.tags.length - 3} more
            </Badge>
          )}
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <div className="flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span>{formatDate(trip.startDate)}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            <span>{trip.currentParticipants}/{trip.maxParticipants}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 bg-muted/30 flex justify-between items-center">
        <div className="flex items-center">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={trip.creator?.avatar_url} />
            <AvatarFallback>
              {trip.creator?.username?.substring(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs">{trip.creator?.username || 'Anonymous'}</span>
        </div>
        <Button size="sm" asChild>
          <Link to={`/group/${trip.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BudgetTravelCard;
