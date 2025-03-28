
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Upload, Plus, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ProtectedRoute from '@/components/ProtectedRoute';

const CreateGroup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [maxParticipants, setMaxParticipants] = useState<string>("4");
  const [budgetRange, setBudgetRange] = useState<number[]>([15000]);
  const [formState, setFormState] = useState({
    title: '',
    destination: '',
    description: '',
  });
  
  // Check if coming from local travel flow and pre-fill data
  useEffect(() => {
    if (location.state?.fromLocalTravel) {
      const { state, destination } = location.state;
      setFormState({
        title: `${destination} Local Adventure`,
        destination: `${destination}, ${state}`,
        description: `Exploring the local wonders of ${destination}!`,
      });
      
      // Add some suggested tags based on the destination
      setTags(['Local Tourism', 'Weekend Trip']);
    }
  }, [location.state]);
  
  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag) && tags.length < 6) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const uploadImage = async () => {
    if (!imageFile || !user) return null;
    
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    try {
      const { error: uploadError, data } = await supabase.storage
        .from('travel-images')
        .upload(fileName, imageFile);
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('travel-images')
        .getPublicUrl(fileName);
        
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };
  
  const saveGroupTags = async (groupId: string) => {
    if (tags.length === 0) return;
    
    const tagObjects = tags.map(tag => ({
      travel_group_id: groupId,
      tag
    }));
    
    try {
      const { error } = await supabase
        .from('group_tags')
        .insert(tagObjects);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error saving tags:', error);
      toast.error('Failed to save tags');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates for your trip");
      return;
    }
    
    if (!profile) {
      toast.error("You need to be logged in to create a travel group");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Upload image if present
      const imageUrl = await uploadImage();
      
      // Create travel group
      const { data: groupData, error: groupError } = await supabase
        .from('travel_groups')
        .insert({
          title: formState.title,
          destination: formState.destination,
          description: formState.description,
          creator_id: profile.id,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          max_participants: parseInt(maxParticipants),
          budget_range: budgetRange[0],
          image_url: imageUrl
        })
        .select()
        .single();
        
      if (groupError) throw groupError;
      
      // Save tags
      await saveGroupTags(groupData.id);
      
      toast.success("Your travel group has been created successfully!");
      navigate(`/group/${groupData.id}`);
    } catch (error) {
      console.error('Error creating travel group:', error);
      toast.error("Failed to create travel group. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-3xl animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Create a Travel Group</h1>
          <p className="text-muted-foreground mb-8">
            Share your travel plans and find companions for your next adventure
          </p>
          
          <form onSubmit={handleSubmit}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Trip Details</CardTitle>
                <CardDescription>Basic information about your trip</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Trip Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., Weekend Hiking in the Himalayas" 
                    required 
                    value={formState.title}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input 
                    id="destination" 
                    placeholder="e.g., Manali, Himachal Pradesh" 
                    required 
                    value={formState.destination}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          disabled={(date) => date < (startDate || new Date())}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Trip Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe your trip plans, activities, and what kind of travelers you're looking for..." 
                    className="min-h-[120px]"
                    value={formState.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Trip Details & Preferences</CardTitle>
                <CardDescription>Help travelers understand your trip better</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="max-travelers">Maximum Travelers</Label>
                    <Select 
                      defaultValue={maxParticipants}
                      onValueChange={setMaxParticipants}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select maximum number of travelers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 travelers</SelectItem>
                        <SelectItem value="4">4 travelers</SelectItem>
                        <SelectItem value="6">6 travelers</SelectItem>
                        <SelectItem value="8">8 travelers</SelectItem>
                        <SelectItem value="10">10 travelers</SelectItem>
                        <SelectItem value="12">12+ travelers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Primary Language</Label>
                    <Select defaultValue="english">
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="hindi">Hindi</SelectItem>
                        <SelectItem value="tamil">Tamil</SelectItem>
                        <SelectItem value="telugu">Telugu</SelectItem>
                        <SelectItem value="bengali">Bengali</SelectItem>
                        <SelectItem value="marathi">Marathi</SelectItem>
                        <SelectItem value="punjabi">Punjabi</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price-range">Estimated Budget Range (per person)</Label>
                  <Slider 
                    defaultValue={budgetRange} 
                    max={60000} 
                    step={5000}
                    onValueChange={setBudgetRange}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>₹0</span>
                    <span>₹15000</span>
                    <span>₹30000</span>
                    <span>₹45000</span>
                    <span>₹60000+</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Activities & Interests (up to 6)</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <Badge key={tag} className="bg-voyani-100 text-voyani-800 border-0 py-1 px-3">
                        {tag}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an activity or interest"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button type="button" variant="secondary" onClick={handleAddTag} disabled={tags.length >= 6 || !newTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add activities like temple visits, street food tours, or interests like photography
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Trip Image</CardTitle>
                <CardDescription>Upload an image that represents your trip</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  {previewImage ? (
                    <div className="relative">
                      <img
                        src={previewImage}
                        alt="Trip preview"
                        className="mx-auto h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setPreviewImage(null);
                          setImageFile(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag and drop an image, or click to browse
                      </p>
                      <Input
                        id="trip-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('trip-image')?.click()}
                      >
                        Select Image
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <CardFooter className="flex justify-between px-0">
              <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating Group..." : "Create Travel Group"}
              </Button>
            </CardFooter>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default CreateGroup;
