
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import TravelGroupCard, { TravelGroup } from '@/components/TravelGroupCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X, Calendar, Users, MapPin } from 'lucide-react';

// Sample data
const allGroups: TravelGroup[] = [
  {
    id: '1',
    title: 'Beach Getaway in Bali',
    destination: 'Bali, Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    startDate: '2023-11-15',
    endDate: '2023-11-25',
    maxParticipants: 8,
    currentParticipants: 5,
    tags: ['Beach', 'Relaxation', 'Nightlife', 'Culture']
  },
  {
    id: '2',
    title: 'Tokyo Anime & Culture Tour',
    destination: 'Tokyo, Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    startDate: '2023-12-05',
    endDate: '2023-12-15',
    maxParticipants: 6,
    currentParticipants: 3,
    tags: ['Urban', 'Anime', 'Shopping', 'Food']
  },
  {
    id: '3',
    title: 'Hiking the Italian Alps',
    destination: 'Dolomites, Italy',
    image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=800&q=80',
    startDate: '2024-01-10',
    endDate: '2024-01-18',
    maxParticipants: 10,
    currentParticipants: 6,
    tags: ['Hiking', 'Mountains', 'Adventure', 'Nature']
  },
  {
    id: '4',
    title: 'Safari Adventure in Kenya',
    destination: 'Maasai Mara, Kenya',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
    startDate: '2024-02-01',
    endDate: '2024-02-10',
    maxParticipants: 12,
    currentParticipants: 8,
    tags: ['Wildlife', 'Safari', 'Photography', 'Nature']
  },
  {
    id: '5',
    title: 'Exploring Ancient Ruins of Greece',
    destination: 'Athens, Greece',
    image: 'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?auto=format&fit=crop&w=800&q=80',
    startDate: '2024-03-15',
    endDate: '2024-03-25',
    maxParticipants: 8,
    currentParticipants: 2,
    tags: ['History', 'Culture', 'Architecture', 'Food']
  },
  {
    id: '6',
    title: 'Northern Lights in Iceland',
    destination: 'Reykjavik, Iceland',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80',
    startDate: '2024-01-20',
    endDate: '2024-01-28',
    maxParticipants: 6,
    currentParticipants: 4,
    tags: ['Northern Lights', 'Winter', 'Photography', 'Hot Springs']
  }
];

const BrowseGroups = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredGroups, setFilteredGroups] = useState<TravelGroup[]>(allGroups);
  
  // All unique tags from groups
  const allTags = [...new Set(allGroups.flatMap(group => group.tags))].sort();
  
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prevTags => 
      prevTags.includes(tag)
        ? prevTags.filter(t => t !== tag)
        : [...prevTags, tag]
    );
  };
  
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
    
    setFilteredGroups(results);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
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
              onKeyUp={(e) => e.key === 'Enter' && handleFilter()}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-2"
                onClick={() => {
                  setSearchTerm('');
                  handleFilter();
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
                    <Select defaultValue="any">
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
                    <Select defaultValue="any">
                      <SelectTrigger>
                        <SelectValue placeholder="Any destination" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any destination</SelectItem>
                        <SelectItem value="asia">Asia</SelectItem>
                        <SelectItem value="europe">Europe</SelectItem>
                        <SelectItem value="north-america">North America</SelectItem>
                        <SelectItem value="south-america">South America</SelectItem>
                        <SelectItem value="africa">Africa</SelectItem>
                        <SelectItem value="oceania">Oceania</SelectItem>
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
                    <Slider defaultValue={[7]} max={14} step={1} />
                  </div>
                </div>
                
                <div>
                  <Label className="text-base font-medium mb-2 block">Group Size</Label>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-muted-foreground mr-2" />
                    <Select defaultValue="any">
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
                          ? "bg-voyani-500" 
                          : "hover:bg-voyani-100 hover:text-voyani-700"
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
