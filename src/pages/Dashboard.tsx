import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Users, Calendar, Loader2, Plus, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import TravelGroupCard from '@/components/TravelGroupCard';
import { BudgetTravelCard } from '@/components/BudgetTravelCard';
import { toast } from 'sonner';

const Dashboard = () => {
  const { profile, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<any[]>([]);
  const [suggestedGroups, setSuggestedGroups] = useState<any[]>([]);
  const [budgetTrips, setBudgetTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if profile is complete
    if (profile && (!profile.full_name || !profile.username || !profile.location)) {
      toast.info('Please complete your profile to continue');
      navigate('/profile');
      return;
    }

    if (user?.id) {
      fetchUserGroups();
      fetchSuggestedGroups();
      fetchBudgetTrips();
    }
  }, [user?.id, profile, navigate]);
  
  const fetchUserGroups = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch groups created by the user
      const { data: createdGroups, error: createdError } = await supabase
        .from('travel_groups')
        .select(`
          *,
          creator:profiles(full_name, avatar_url),
          members:group_members(profile_id, status)
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });
        
      if (createdError) throw createdError;
      
      // Fetch groups joined by the user
      const { data: memberGroups, error: memberError } = await supabase
        .from('group_members')
        .select(`
          travel_group:travel_groups(
            *,
            creator:profiles(full_name, avatar_url),
            members:group_members(profile_id, status)
          )
        `)
        .eq('profile_id', user.id)
        .eq('status', 'accepted')
        .neq('travel_group.creator_id', user.id);
        
      if (memberError) throw memberError;
      
      // Format created groups
      const formattedCreatedGroups = createdGroups.map(group => ({
        ...group,
        id: group.id,
        title: group.title,
        destination: group.destination,
        image: group.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop',
        startDate: group.start_date,
        endDate: group.end_date,
        maxParticipants: group.max_participants,
        currentParticipants: group.members.filter((m: any) => m.status === 'accepted').length
      }));
      
      // Format joined groups
      const formattedJoinedGroups = memberGroups.map(item => {
        const group = item.travel_group;
        return {
          ...group,
          id: group.id,
          title: group.title,
          destination: group.destination,
          image: group.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop',
          startDate: group.start_date,
          endDate: group.end_date,
          maxParticipants: group.max_participants,
          currentParticipants: group.members.filter((m: any) => m.status === 'accepted').length
        };
      });
      
      setMyGroups(formattedCreatedGroups);
      setJoinedGroups(formattedJoinedGroups);
    } catch (error) {
      console.error('Error fetching user groups:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchSuggestedGroups = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch travel groups not created or joined by the user
      const { data, error } = await supabase
        .from('travel_groups')
        .select(`
          *,
          creator:profiles(full_name, avatar_url),
          members:group_members(profile_id, status)
        `)
        .order('created_at', { ascending: false })
        .limit(4);
        
      if (error) throw error;
      
      // Filter out groups created by user or already joined
      const filtered = data.filter(group => {
        const isCreator = group.creator_id === user.id;
        const isMember = group.members.some((m: any) => 
          m.profile_id === user.id && m.status === 'accepted'
        );
        return !isCreator && !isMember;
      });
      
      // Format suggested groups
      const formattedGroups = filtered.map(group => ({
        ...group,
        id: group.id,
        title: group.title,
        destination: group.destination,
        image: group.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop',
        startDate: group.start_date,
        endDate: group.end_date,
        maxParticipants: group.max_participants,
        currentParticipants: group.members.filter((m: any) => m.status === 'accepted').length
      }));
      
      setSuggestedGroups(formattedGroups);
    } catch (error) {
      console.error('Error fetching suggested groups:', error);
    }
  };
  
  const fetchBudgetTrips = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch budget-friendly trips (low budget_range)
      const { data, error } = await supabase
        .from('travel_groups')
        .select(`
          *,
          creator:profiles(full_name, avatar_url),
          members:group_members(profile_id, status)
        `)
        .order('budget_range', { ascending: true })
        .limit(4);
        
      if (error) throw error;
      
      // Format budget trips
      const formattedGroups = data.map(group => ({
        ...group,
        id: group.id,
        title: group.title,
        destination: group.destination,
        image: group.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop',
        startDate: group.start_date,
        endDate: group.end_date,
        maxParticipants: group.max_participants,
        currentParticipants: group.members.filter((m: any) => m.status === 'accepted').length,
        budget: group.budget_range
      }));
      
      setBudgetTrips(formattedGroups);
    } catch (error) {
      console.error('Error fetching budget trips:', error);
    }
  };
  
  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return name.substring(0, 2);
  };
  
  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {profile?.full_name || 'Traveler'}</p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link to="/create-group">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/messages">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">My Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myGroups.length}</div>
                <p className="text-xs text-muted-foreground">Groups you've created</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Joined Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{joinedGroups.length}</div>
                <p className="text-xs text-muted-foreground">Groups you're part of</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {myGroups.filter(g => new Date(g.startDate) > new Date()).length + 
                   joinedGroups.filter(g => new Date(g.startDate) > new Date()).length}
                </div>
                <p className="text-xs text-muted-foreground">Starting soon</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Unread messages</p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="my-trips" className="mb-8">
            <TabsList>
              <TabsTrigger value="my-trips">My Trips</TabsTrigger>
              <TabsTrigger value="joined">Joined Trips</TabsTrigger>
              <TabsTrigger value="suggested">Suggested For You</TabsTrigger>
              <TabsTrigger value="budget">Budget Friendly</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-trips" className="mt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : myGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            
            <TabsContent value="joined" className="mt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : joinedGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {joinedGroups.map(group => (
                    <TravelGroupCard key={group.id} group={group} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted rounded-lg">
                  <h3 className="text-xl font-medium mb-2">You haven't joined any trips</h3>
                  <p className="text-muted-foreground mb-6">
                    Explore travel groups and join ones that match your interests.
                  </p>
                  <Button asChild>
                    <Link to="/browse">Browse Travel Groups</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="suggested" className="mt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : suggestedGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suggestedGroups.map(group => (
                    <TravelGroupCard key={group.id} group={group} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted rounded-lg">
                  <h3 className="text-xl font-medium mb-2">No suggested trips available</h3>
                  <p className="text-muted-foreground mb-6">
                    Check back later or browse all available travel groups.
                  </p>
                  <Button asChild>
                    <Link to="/browse">Browse All Groups</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="budget" className="mt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : budgetTrips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {budgetTrips.map(trip => (
                    <BudgetTravelCard 
                      key={trip.id} 
                      group={{
                        id: trip.id,
                        title: trip.title,
                        destination: trip.destination,
                        image_url: trip.image,
                        start_date: trip.startDate,
                        end_date: trip.endDate,
                        max_participants: trip.maxParticipants,
                        current_participants: trip.currentParticipants,
                        tags: [], // Since we don't have tags in the current data
                        budget: trip.budget
                      }} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted rounded-lg">
                  <h3 className="text-xl font-medium mb-2">No budget trips available</h3>
                  <p className="text-muted-foreground mb-6">
                    Check back later for budget-friendly travel options.
                  </p>
                  <Button asChild>
                    <Link to="/browse">Browse All Groups</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Dashboard;
