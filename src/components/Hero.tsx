
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="hero-gradient rounded-3xl overflow-hidden">
      <div className="container mx-auto px-4 py-20 sm:py-24 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center">
            <span className="inline-flex items-center rounded-full px-4 py-1 text-xs font-medium bg-voyani-100 text-voyani-800 mb-6 animate-fade-in">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-voyani-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-voyani-500"></span>
              </span>
              Discover Travel Companions For Your Next Adventure
            </span>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl animate-fade-in text-balance">
            <span className="block">Travel Together,</span>
            <span className="block text-voyani-600">Create Memories</span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-gray-600 animate-fade-in animate-delay-100 text-balance">
            Connect with like-minded travelers, join exciting group trips, and explore the world in good company. 
            Whether you're looking for adventure buddies or planning your own journey, Voyani makes group travel simple.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-x-6 animate-fade-in animate-delay-200">
            <Button 
              size="lg" 
              className="text-md px-6 py-6 shadow-lg hover-lift"
              onClick={() => navigate('/browse')}
            >
              Explore Trips
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-md px-6 py-6 hover-lift"
              onClick={() => navigate('/create-group')}
            >
              Create a Trip
            </Button>
          </div>
          
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: MapPin, title: "Worldwide Destinations", description: "Connect with travelers heading anywhere in the world" },
              { icon: Users, title: "Verified Travelers", description: "Safe travels with our community verification system" },
              { icon: Calendar, title: "Flexible Planning", description: "Find trips that match your schedule and interests" }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/40 hover-lift animate-fade-in"
                style={{ animationDelay: `${(index + 3) * 100}ms` }}
              >
                <div className="flex justify-center items-center h-12 w-12 rounded-full bg-voyani-100 text-voyani-600 mx-auto mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
