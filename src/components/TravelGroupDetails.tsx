import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Users, Clock, Globe, Info, MessageSquare, Settings, Crown } from 'lucide-react';
import type { TravelGroup } from './TravelGroupCard';
import { Link } from 'react-router-dom';

interface TravelGroupDetailsProps {
  group: TravelGroup;
}

const TravelGroupDetails: React.FC<TravelGroupDetailsProps> = ({ group }) => {
  // Format date display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Calculate trip duration
  const startDate = new Date(group.startDate);
  const endDate = new Date(group.endDate);
  const tripDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate days until trip
  const daysUntil = Math.ceil((startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="animate-fade-in">
      <div className="relative">
        <div className="h-64 md:h-96 w-full rounded-2xl overflow-hidden">
          <img 
            src={group.image} 
            alt={group.title} 
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
        
        <div className="absolute bottom-0 left-0 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-voyani-800 font-medium">
              {daysUntil > 0 ? `${daysUntil} days away` : "Ongoing"}
            </Badge>
            {group.isCreator && (
              <Badge className="bg-voyani-600 text-white border-0 flex items-center">
                <Crown className="h-3 w-3 mr-1" />
                Created by you
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{group.title}</h1>
          <div className="flex items-center text-white/90">
            <MapPin className="h-5 w-5 mr-2 text-voyani-300" />
            <span className="text-lg">{group.destination}</span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="glass-card rounded-xl p-6 mb-8 animate-fade-in animate-delay-100">
              <div className="flex flex-wrap gap-4 md:gap-8">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-voyani-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Dates</div>
                    <div className="font-medium">{formatDate(group.startDate)} - {formatDate(group.endDate)}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-voyani-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="font-medium">{tripDuration} days</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-voyani-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Group Size</div>
                    <div className="font-medium">{group.currentParticipants}/{group.maxParticipants} travelers</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-voyani-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Language</div>
                    <div className="font-medium">Hindi, English</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-8 animate-fade-in animate-delay-200">
              <h2 className="text-2xl font-bold mb-4">About This Trip</h2>
              <p className="text-gray-300 mb-4">
                Join us for an unforgettable adventure to {group.destination}! This trip is perfect for travelers who love
                {group.tags.join(', ')}. We'll explore local culture, enjoy the beautiful scenery, and create memories together.
              </p>
              <p className="text-gray-300 mb-4">
                Our itinerary includes plenty of time for both group activities and personal exploration.
                This trip is designed for {group.tags[0]?.toLowerCase()} enthusiasts who want to experience
                the best that {group.destination} has to offer in good company.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Trip Highlights</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                <li>Explore the stunning landscapes and natural beauty</li>
                <li>Experience local culture and cuisine with insider recommendations</li>
                <li>Flexible itinerary with both group activities and free time</li>
                <li>Meet like-minded travelers and make new friends</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">What's Included</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                <li>Accommodation in shared rooms (private options available)</li>
                <li>Welcome dinner and farewell celebration</li>
                <li>Local transportation for group activities</li>
                <li>Trip organization and coordination</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Trip Tags</h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {group.tags.map((tag, index) => (
                  <Badge key={index} className="bg-voyani-100 text-voyani-800 border-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1 animate-fade-in animate-delay-300">
            <Card className="overflow-hidden sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">
                  {group.isCreator ? 'Manage Trip' : 'Join This Trip'}
                </h3>
                
                <div className="flex justify-between mb-4">
                  <span className="text-muted-foreground">Trip Status</span>
                  <Badge variant="outline" className="bg-voyani-50 text-voyani-700 border-0">
                    Open
                  </Badge>
                </div>
                
                <div className="flex justify-between mb-4">
                  <span className="text-muted-foreground">Spots Left</span>
                  <span className="font-medium">{group.maxParticipants - group.currentParticipants} of {group.maxParticipants}</span>
                </div>
                
                <Separator className="my-4" />
                
                {group.isCreator ? (
                  <div className="space-y-3">
                    <Button className="w-full flex items-center justify-center gap-2">
                      <Settings className="h-4 w-4" />
                      Manage Trip Settings
                    </Button>
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                      <Users className="h-4 w-4" />
                      Manage Members
                    </Button>
                  </div>
                ) : (
                  <>
                    <h4 className="font-medium mb-3">Trip Organizer</h4>
                    <div className="flex items-center mb-6">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback className="bg-voyani-100 text-voyani-700">
                          AD
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">Amit Desai</div>
                        <div className="text-sm text-muted-foreground">18 trips organized</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Button className="w-full">Request to Join</Button>
                      <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Message Organizer
                      </Button>
                    </div>
                    
                    <div className="mt-6 text-sm text-muted-foreground flex items-start">
                      <Info className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                      <p>
                        Your request will be reviewed by the trip organizer. 
                        You'll be notified once it's approved.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelGroupDetails;
