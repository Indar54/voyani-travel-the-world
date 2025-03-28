
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import TravelGroupCard, { TravelGroup } from '@/components/TravelGroupCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X, Calendar, Users, MapPin } from 'lucide-react';

// Sample data
const allGroups: TravelGroup[] = [
  {
    id: '1',
    title: 'Beach Getaway in Goa',
    destination: 'Goa, India',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop',
    startDate: '2023-11-15',
    endDate: '2023-11-25',
    maxParticipants: 8,
    currentParticipants: 5,
    tags: ['Beach', 'Relaxation', 'Nightlife', 'Culture']
  },
  {
    id: '2',
    title: 'Temple Tour in Madurai',
    destination: 'Tamil Nadu, India',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop',
    startDate: '2023-12-05',
    endDate: '2023-12-15',
    maxParticipants: 6,
    currentParticipants: 3,
    tags: ['Temple', 'Architecture', 'Spirituality', 'Food']
  },
  {
    id: '3',
    title: 'Trekking in Himachal',
    destination: 'Himachal Pradesh, India',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop',
    startDate: '2024-01-10',
    endDate: '2024-01-18',
    maxParticipants: 10,
    currentParticipants: 6,
    tags: ['Trekking', 'Mountains', 'Adventure', 'Nature']
  },
  {
    id: '4',
    title: 'Wildlife Safari in Ranthambore',
    destination: 'Rajasthan, India',
    image: 'https://images.unsplash.com/photo-1615031644648-282022864623?q=80&w=800&auto=format&fit=crop',
    startDate: '2024-02-01',
    endDate: '2024-02-10',
    maxParticipants: 12,
    currentParticipants: 8,
    tags: ['Wildlife', 'Safari', 'Photography', 'Nature']
  },
  {
    id: '5',
    title: 'Heritage Walk in Delhi',
    destination: 'Delhi, India',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop',
    startDate: '2024-03-15',
    endDate: '2024-03-25',
    maxParticipants: 8,
    currentParticipants: 2,
    tags: ['History', 'Culture', 'Architecture', 'Food']
  },
  {
    id: '6',
    title: 'Backwaters of Kerala',
    destination: 'Kerala, India',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop',
    startDate: '2024-01-20',
    endDate: '2024-01-28',
    maxParticipants: 6,
    currentParticipants: 4,
    tags: ['Backwaters', 'Relaxation', 'Nature', 'Cuisine']
  }
];

const BrowseGroups = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredGroups, setFilteredGroups] = useState<TravelGroup[]>(allGroups);
  const [dateRange, setDateRange] = useState<string>("any");
  const [destination, setDestination] = useState<string>("any");
  const [duration, setDuration] = useState<number[]>([7]);
  const [groupSize, setGroupSize] = useState<string>("any");
  
  // All unique tags from groups
  const allTags = [...new Set(allGroups.flatMap(group => group.tags))].sort();
  
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prevTags => 
      prevTags.includes(tag)
        ? prevTags.filter(t => t !== tag)
        : [...prevTags, tag]
    );
  };
  
  // Apply search immediately when typing
  useEffect(() => {
    handleFilter();
  }, [searchTerm]);
  
  const handleFilter = () => {
    let results = allGroups;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        group => 
          group.title.toLowerCase().includes(term) || 
          group.destination.toLowerCase().includes(term) ||
          group.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Filter by tags
    if (selectedTags.length > 0) {
      results = results.filter(
        group => selectedTags.some(tag => group.tags.includes(tag))
      );
    }
    
    // Filter by date range (if implemented)
    if (dateRange !== "any") {
      const now = new Date();
      const oneMonthLater = new Date(now);
      oneMonthLater.setMonth(now.getMonth() + 1);
      
      const threeMonthsLater = new Date(now);
      threeMonthsLater.setMonth(now.getMonth() + 3);
      
      const sixMonthsLater = new Date(now);
      sixMonthsLater.setMonth(now.getMonth() + 6);
      
      results = results.filter(group => {
        const startDate = new Date(group.startDate);
        
        switch(dateRange) {
          case "next-month":
            return startDate >= now && startDate <= oneMonthLater;
          case "next-3-months":
            return startDate >= now && startDate <= threeMonthsLater;
          case "next-6-months":
            return startDate >= now && startDate <= sixMonthsLater;
          default:
            return true;
        }
      });
    }
    
    // Filter by destination
    if (destination !== "any") {
      results = results.filter(group => {
        return group.destination.toLowerCase().includes(destination.toLowerCase());
      });
    }
    
    // Filter by group size
    if (groupSize !== "any") {
      results = results.filter(group => {
        switch(groupSize) {
          case "small":
            return group.maxParticipants >= 2 && group.maxParticipants <= 4;
          case "medium":
            return group.maxParticipants >= 5 && group.maxParticipants <= 8;
          case "large":
            return group.maxParticipants >= 9;
          default:
            return true;
        }
      });
    }
    
    setFilteredGroups(results);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setDateRange("any");
    setDestination("any");
    setDuration([7]);
    setGroupSize("any");
    setFilteredGroups(allGroups);
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Explore Travel Groups</h1>
            <p className="text-muted-foreground">Find your perfect travel companions for your next adventure</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              className="pl-10 pr-10 py-6 bg-white shadow-sm"
              placeholder="Search by destination, activity, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-2"
                onClick={() => {
                  setSearchTerm('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {showFilters && (
          <Card className="mb-8 animate-fade-in">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <Label className="text-base font-medium mb-2 block">Date Range</Label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                    <Select 
                      value={dateRange}
                      onValueChange={setDateRange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any time</SelectItem>
                        <SelectItem value="next-month">Next Month</SelectItem>
                        <SelectItem value="next-3-months">Next 3 Months</SelectItem>
                        <SelectItem value="next-6-months">Next 6 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label className="text-base font-medium mb-2 block">Destination</Label>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                    <Select 
                      value={destination}
                      onValueChange={setDestination}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any destination" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any destination</SelectItem>
                        <SelectItem value="goa">Goa</SelectItem>
                        <SelectItem value="tamil">Tamil Nadu</SelectItem>
                        <SelectItem value="himachal">Himachal Pradesh</SelectItem>
                        <SelectItem value="rajasthan">Rajasthan</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="kerala">Kerala</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label className="text-base font-medium mb-2 block">Duration</Label>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">1-14 days</span>
                    </div>
                    <Slider 
                      defaultValue={duration} 
                      max={14} 
                      step={1}
                      onValueChange={setDuration}
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-base font-medium mb-2 block">Group Size</Label>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-muted-foreground mr-2" />
                    <Select
                      value={groupSize}
                      onValueChange={setGroupSize}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any size</SelectItem>
                        <SelectItem value="small">Small (2-4)</SelectItem>
                        <SelectItem value="medium">Medium (5-8)</SelectItem>
                        <SelectItem value="large">Large (9+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <Label className="text-base font-medium mb-4 block">Interests & Activities</Label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        selectedTags.includes(tag) 
                          ? "bg-gray-800" 
                          : "hover:bg-gray-100 hover:text-gray-700"
                      }`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                      {selectedTags.includes(tag) && <X className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button onClick={handleFilter}>
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group, index) => (
              <div key={group.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <TravelGroupCard group={group} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">😢</div>
            <h3 className="text-xl font-medium mb-2">No trips found</h3>
            <p className="text-muted-foreground mb-6">
              We couldn't find any trips matching your criteria.
            </p>
            <Button onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BrowseGroups;
