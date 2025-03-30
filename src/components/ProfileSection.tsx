import React, { useEffect, useState, useCallback } from 'react';
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
    travel_interests: profile?.travel_interests || [],
    languages: profile?.languages || []
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [availableLanguages] = useState([
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Bengali', 'Dutch'
  ]);

  const [availableInterests] = useState([
    'Adventure', 'Culture', 'Nature', 'Food', 'History', 'Art', 'Music',
    'Photography', 'Hiking', 'Beach', 'City', 'Wildlife', 'Shopping', 'Nightlife'
  ]);

  const fetchUserGroups = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.id) {
        console.error('No user ID found');
        setMyGroups([]);
        return;
      }

      // Simple query to fetch created groups
      const { data: createdGroups, error: createdError } = await supabase
        .from('travel_groups')
        .select('*')
        .eq('creator_id', user.id);

      if (createdError) {
        console.error('Error fetching created groups:', createdError);
        throw createdError;
      }

      console.log('Created groups:', createdGroups);

      // Simple query to fetch groups where user is a member
      const { data: memberGroups, error: memberError } = await supabase
        .from('group_members')
        .select('travel_group_id')
        .eq('profile_id', user.id)
        .eq('status', 'accepted');

      if (memberError) {
        console.error('Error fetching member groups:', memberError);
        throw memberError;
      }

      console.log('Member group IDs:', memberGroups);

      // Fetch full details of member groups
      const memberGroupIds = memberGroups.map(m => m.travel_group_id);
      const { data: memberGroupDetails, error: memberDetailsError } = await supabase
        .from('travel_groups')
        .select('*')
        .in('id', memberGroupIds);

      if (memberDetailsError) {
        console.error('Error fetching member group details:', memberDetailsError);
        throw memberDetailsError;
      }

      console.log('Member group details:', memberGroupDetails);

      // Format created groups
      const formattedCreatedGroups = (createdGroups || []).map(group => ({
        id: group.id,
        title: group.title,
        destination: group.destination,
        image: group.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop',
        startDate: group.start_date,
        endDate: group.end_date,
        maxParticipants: group.max_participants,
        currentParticipants: 1, // At least the creator
        tags: [],
        isCreator: true
      }));

      // Format member groups
      const formattedMemberGroups = (memberGroupDetails || []).map(group => ({
        id: group.id,
        title: group.title,
        destination: group.destination,
        image: group.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop',
        startDate: group.start_date,
        endDate: group.end_date,
        maxParticipants: group.max_participants,
        currentParticipants: 1, // At least one member
        tags: [],
        isCreator: false
      }));

      // Combine and sort all groups by date
      const allGroups = [...formattedCreatedGroups, ...formattedMemberGroups]
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      
      console.log('All formatted groups:', allGroups);
      
      if (allGroups.length === 0) {
        console.log('No groups found for user');
        setMyGroups([]);
      } else {
        setMyGroups(allGroups);
      }
    } catch (error) {
      console.error('Error in fetchUserGroups:', error);
      toast.error('Failed to load your trips. Please try again later.');
      setMyGroups([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Add a refresh function
  const refreshGroups = () => {
    fetchUserGroups();
  };

  // Add useEffect to refresh groups when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchUserGroups();
    }
  }, [user, fetchUserGroups]);

  // Add useEffect to refresh groups when the component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        refreshGroups();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, refreshGroups]);

  // Add a function to check if a group exists
  const checkGroupExists = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('travel_groups')
        .select('id')
        .eq('id', groupId)
        .single();

      if (error) {
        console.error('Error checking group:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in checkGroupExists:', error);
      return false;
    }
  };

  const handleInterestToggle = useCallback((interest: string) => {
    setEditForm(prev => ({
      ...prev,
      travel_interests: prev.travel_interests.includes(interest)
        ? prev.travel_interests.filter(i => i !== interest)
        : [...prev.travel_interests, interest]
    }));
  }, []);

  const handleLanguageToggle = useCallback((language: string) => {
    setEditForm(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  }, []);

  const handleSaveProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          location: editForm.location,
          bio: editForm.bio,
          travel_interests: editForm.travel_interests,
          languages: editForm.languages,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  }, [user, editForm]);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!user) {
        console.error('No authenticated user found');
        toast.error('Please sign in to upload a profile picture');
        return;
      }

      setIsUploading(true);
      const file = event.target.files?.[0];
      if (!file) {
        toast.error('Please select a file');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, or GIF)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size should be less than 5MB');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').pop();
        if (oldPath) {
          const { error: deleteError } = await supabase.storage
            .from('avatars')
            .remove([`avatars/${oldPath}`]);
          
          if (deleteError) {
            console.error('Error deleting old avatar:', deleteError);
          }
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  }, [user, avatarUrl]);

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
                          id="avatar-upload"
                        />
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          disabled={isUploading}
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                        >
                          {isUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
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
                      <div className="space-y-4">
                        <div>
                          <Label>Travel Interests</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {availableInterests.map((interest) => (
                              <Badge
                                key={interest}
                                variant={editForm.travel_interests.includes(interest) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => handleInterestToggle(interest)}
                              >
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label>Languages</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {availableLanguages.map((language) => (
                              <Badge
                                key={language}
                                variant={editForm.languages.includes(language) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => handleLanguageToggle(language)}
                              >
                                {language}
                              </Badge>
                            ))}
                          </div>
                        </div>
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
                    {profile?.travel_interests?.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile?.languages?.map((language) => (
                      <Badge key={language} variant="secondary">
                        {language}
                      </Badge>
                    ))}
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
                    <Link key={group.id} to={`/group/${group.id}`}>
                      <TravelGroupCard group={group} />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted rounded-lg">
                  <h3 className="text-xl font-medium mb-2">No trips yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start your travel journey by creating a new travel group.
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
