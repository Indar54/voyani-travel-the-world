
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Edit, Calendar, Star, Shield, Globe, Flag } from 'lucide-react';

interface ProfileSectionProps {
  isOwnProfile?: boolean;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ isOwnProfile = true }) => {
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="bg-voyani-100 text-voyani-700 text-2xl">
                    JD
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">Jessica Doe</h2>
                <div className="flex items-center text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>San Francisco, USA</span>
                </div>
                <div className="flex items-center mt-3">
                  <Badge className="bg-voyani-100 text-voyani-800 border-0 mr-2">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <Star className="h-3 w-3 mr-1 text-amber-500" />
                    4.9 (12)
                  </Badge>
                </div>
              </div>
              
              {isOwnProfile && (
                <Button variant="outline" className="w-full mb-6">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">About</h3>
                  <p className="text-sm">
                    Adventure enthusiast and nature lover. I enjoy hiking, photography, and experiencing different cultures.
                    Always looking for my next travel companion!
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Travel Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Nature", "Photography", "Hiking", "Food", "Culture"].map((interest, index) => (
                      <Badge key={index} variant="outline" className="bg-background">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Languages</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">English</span>
                      <span className="text-sm font-medium">Native</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Spanish</span>
                      <span className="text-sm font-medium">Conversational</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">French</span>
                      <span className="text-sm font-medium">Basic</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Member Since</h3>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">October 2022</span>
                  </div>
                </div>
              </div>
              
              {!isOwnProfile && (
                <div className="mt-6 space-y-3">
                  <Button className="w-full">Message</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Tabs defaultValue="trips">
            <TabsList className="w-full">
              <TabsTrigger value="trips" className="flex-1">My Trips</TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
              <TabsTrigger value="badges" className="flex-1">Badges</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trips" className="mt-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="overflow-hidden hover-lift">
                    <div className="aspect-w-16 aspect-h-9 relative">
                      <img 
                        src={`https://source.unsplash.com/random/300x200?travel&sig=${i}`} 
                        alt="Trip"
                        className="object-cover w-full h-32"
                      />
                      <div className="absolute top-0 right-0 p-2">
                        <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm">
                          {i % 2 === 0 ? "Upcoming" : "Completed"}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-1">{i % 2 === 0 ? "Weekend in Paris" : "Road Trip: California Coast"}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{i % 2 === 0 ? "Paris, France" : "California, USA"}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{i % 2 === 0 ? "Nov 15 - Nov 20, 2023" : "Oct 5 - Oct 15, 2023"}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6 animate-fade-in">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="pb-6 border-b border-border last:border-0 last:pb-0">
                        <div className="flex items-start">
                          <Avatar className="h-10 w-10 mr-4">
                            <AvatarFallback className="bg-voyani-100 text-voyani-700">
                              {String.fromCharCode(65 + i)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <h4 className="font-medium">Alex Johnson</h4>
                              <div className="flex items-center">
                                <Star className="h-4 w-4 mr-1 text-amber-500 fill-amber-500" />
                                <span className="font-medium">5.0</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">From the Paris trip • October 2023</p>
                            <p className="text-sm">
                              Jessica was an amazing travel companion! She's knowledgeable about the local culture,
                              easy-going, and fun to be around. Would definitely travel with her again!
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="badges" className="mt-6 animate-fade-in">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {[
                      { icon: Globe, title: "World Explorer", description: "Visited 5+ countries" },
                      { icon: Flag, title: "Trip Leader", description: "Organized 3+ trips" },
                      { icon: Star, title: "Top Rated", description: "Maintained 4.8+ rating" },
                      { icon: Shield, title: "Verified User", description: "Identity confirmed" },
                      { icon: Users, title: "Social Butterfly", description: "10+ travel companions" },
                    ].map((badge, i) => (
                      <div key={i} className="flex flex-col items-center text-center p-4 bg-muted/20 rounded-xl">
                        <div className="bg-voyani-100 p-3 rounded-full mb-3">
                          <badge.icon className="h-6 w-6 text-voyani-700" />
                        </div>
                        <h4 className="font-medium mb-1">{badge.title}</h4>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
