
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Filter, MapPin, Calendar, UserPlus, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const UserSearch = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const usersPerPage = 20;
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(u => 
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id)
        .range((page - 1) * usersPerPage, page * usersPerPage - 1)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data.length < usersPerPage) {
        setHasMore(false);
      }
      
      if (page === 1) {
        setUsers(data || []);
        setFilteredUsers(data || []);
      } else {
        setUsers(prev => [...prev, ...(data || [])]);
        setFilteredUsers(prev => [...prev, ...(data || [])]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchUsers();
  };
  
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return name.substring(0, 2);
  };
  
  // Helper to format join date
  const formatJoinDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Find Travel Companions</h1>
              <p className="text-muted-foreground">Connect with other travelers in the community</p>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                className="pl-10 pr-10 py-6 bg-white shadow-sm"
                placeholder="Search by name, username, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading && page === 1 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredUsers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <Avatar className="h-16 w-16 mr-4">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{user.full_name}</h3>
                          <p className="text-muted-foreground text-sm">@{user.username}</p>
                          
                          {user.location && (
                            <div className="flex items-center mt-2 text-sm">
                              <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>{user.location}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center mt-2 text-sm">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>Joined {formatJoinDate(user.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {user.bio && (
                        <p className="mt-4 text-sm line-clamp-3">{user.bio}</p>
                      )}
                      
                      <div className="mt-4 flex justify-between items-center">
                        <Button variant="outline" className="flex items-center gap-2" size="sm">
                          <Users className="h-4 w-4" />
                          View Profile
                        </Button>
                        <Button className="flex items-center gap-2" size="sm">
                          <UserPlus className="h-4 w-4" />
                          Connect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button 
                    onClick={loadMore} 
                    variant="outline"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-muted rounded-lg">
              <h3 className="text-xl font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or filters.
              </p>
              <Button onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default UserSearch;
