import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import StateSelection from '@/components/StateSelection';
import { DestinationSelection } from '@/components/DestinationSelection';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Map, LogIn } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const LocalTravel = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [travelMode, setTravelMode] = useState<"local" | "international">("local");
  
  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    setSelectedDestination(null); // Reset destination when state changes
  };
  
  const handleDestinationSelect = (destination: string) => {
    setSelectedDestination(destination);
  };
  
  const handleContinue = () => {
    if (!session) {
      toast.error('Please sign in to create a travel group');
      navigate('/auth', { 
        state: { 
          from: '/local-travel',
          destination: selectedDestination,
          state: selectedState,
          travelMode
        } 
      });
      return;
    }

    if (selectedState && selectedDestination) {
      navigate('/create-group', { 
        state: { 
          fromLocalTravel: true,
          state: selectedState,
          destination: selectedDestination,
          international: travelMode === "international"
        } 
      });
    }
  };
  
  const handleBack = () => {
    if (selectedDestination) {
      setSelectedDestination(null);
    } else if (selectedState) {
      setSelectedState(null);
    } else {
      navigate('/');
    }
  };

  const handleTravelModeChange = (value: string) => {
    setTravelMode(value as "local" | "international");
    setSelectedState(null);
    setSelectedDestination(null);
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">
              {travelMode === "local" ? "Local Travel Plans" : "International Travel Plans"}
            </h1>
          </div>
          
          {!session && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
          )}
        </div>

        <div className="mb-8">
          <Tabs value={travelMode} onValueChange={handleTravelModeChange} className="w-full max-w-md mx-auto">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="local" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                <span>Local Travel</span>
              </TabsTrigger>
              <TabsTrigger value="international" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>International</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {!selectedState ? (
          <StateSelection onSelectState={handleStateSelect} isWorldDestination={travelMode === "international"} />
        ) : !selectedDestination ? (
          <DestinationSelection 
            state={selectedState} 
            onSelectDestination={handleDestinationSelect}
            isWorldDestination={travelMode === "international"}
          />
        ) : (
          <div className="text-center space-y-6 py-12">
            <h2 className="text-2xl font-bold">Ready to Create Your Trip!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              You've selected {selectedDestination} in {selectedState}. 
              {!session ? (
                " Sign in to create a travel group and find companions for your journey."
              ) : (
                " Now you can create a travel group and find companions for your journey."
              )}
            </p>
            <Button 
              size="lg"
              onClick={handleContinue}
              className="mt-4"
            >
              {session ? "Continue to Create Group" : "Sign in to Continue"}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LocalTravel;
