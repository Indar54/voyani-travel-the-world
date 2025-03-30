import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Users, MapPin } from 'lucide-react';

interface BudgetTravelGroup {
  id: string;
  title: string;
  destination: string;
  image_url?: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  current_participants: number;
  tags: string[];
  budget: number;
}

interface BudgetTravelCardProps {
  group: BudgetTravelGroup;
}

export const BudgetTravelCard = ({ group }: BudgetTravelCardProps) => {
  return (
    <Link to={`/group/${group.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48">
          <img
            src={group.image_url || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop"}
            alt={group.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge className="bg-voyani-600 text-white border-0">
              ${group.budget}/day
            </Badge>
          </div>
        </div>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-2">{group.title}</h3>
          <div className="flex items-center text-muted-foreground mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{group.destination}</span>
          </div>
          <div className="flex items-center text-muted-foreground mb-4">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>
              {new Date(group.start_date).toLocaleDateString()} - {new Date(group.end_date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              <span>{group.current_participants}/{group.max_participants} participants</span>
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
