import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Edit, Calendar, Star, Shield, Globe, Flag, Users, Loader2, Upload } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import TravelGroupCard from '@/components/TravelGroupCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ProfileSectionProps {
  isOwnProfile?: boolean;
  profile?: Tables<'profiles'> | null;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ isOwnProfile = true, profile = null }) => {
  const { user } = useAuth();
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [isUploading, setIsUploading] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchUserGroups();
    }
  }, [user]);
  
  const fetchUserGroups = async () => {
    try {
      console.log('Fetching user groups...');
      const { data: createdGroups, error: createdError } = await supabase
        .from('travel_groups')
        .select(`
          *,
          creator:profiles(username, avatar_url),
          tags:group_tags(tag),
          members:group_members(profile_id, status)
        `)
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (createdError) {
        console.error('Error fetching created groups:', createdError);
        throw createdError;
      }
      
      console.log('Created groups:', createdGroups);
      
      // Format created groups
      const formattedGroups = createdGroups.map(group => ({
        ...group,
        id: group.id,
        title: group.title,
        destination: group.destination,
        image: group.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop',
        startDate: group.start_date,
        endDate: group.end_date,
        maxParticipants: group.max_participants,
        currentParticipants: group.members.filter((m: any) => m.status === 'accepted').length,
        tags: group.tags.map((t: any) => t.tag),
      }));
      
      setMyGroups(formattedGroups);
    } catch (error) {
      console.error('Error fetching user groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success('Profile photo updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to update profile photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          location: editForm.location,
          bio: editForm.bio,
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const fullName = profile?.full_name || 'Jessica Doe';
  const location = profile?.location || 'San Francisco, USA';
  const bio = profile?.bio || 'Adventure enthusiast and nature lover. I enjoy hiking, photography, and experiencing different cultures. Always looking for my next travel companion!';
  const username = profile?.username;
  const userInitials = fullName ? `${fullName.charAt(0)}${fullName.split(' ')[1]?.charAt(0) || ''}` : 'JD';

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 mb-4">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={fullName} />
                    ) : null}
                    <AvatarFallback className="bg-voyani-100 text-voyani-700 text-2xl">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  {isOwnProfile && (
                    <div className="absolute bottom-0 right-0">
                      <label className="cursor-pointer">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          disabled={isUploading}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold">{fullName}</h2>
                <div className="flex items-center text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{location}</span>
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
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mb-6">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={editForm.bio}
                          onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleSaveProfile} className="w-full">
                        Save Changes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">About</h3>
                  <p className="text-sm">
                    {bio}
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
                    <span className="text-sm">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'October 2022'}</span>
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
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : myGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myGroups.map(group => (
                    <TravelGroupCard key={group.id} group={group} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted rounded-lg">
                  <h3 className="text-xl font-medium mb-2">No trips created yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start planning your next adventure by creating a new travel group.
                  </p>
                  <Button asChild>
                    <Link to="/create-group">Create Travel Group</Link>
                  </Button>
                </div>
              )}
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
