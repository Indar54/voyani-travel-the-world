
import React from 'react';
import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import FeaturedGroups from '@/components/FeaturedGroups';
import { Button } from '@/components/ui/button';
import { Globe, Users, Calendar, ArrowRight, Heart } from 'lucide-react';

const Index = () => {
  return (
    <Layout>
      <div className="space-y-20">
        <Hero />
        
        <FeaturedGroups />
        
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-1 flex flex-col justify-center">
                <div className="animate-fade-in">
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    Why Travel With Voyani?
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                    Join our growing community of travelers who've discovered
                    the joy of shared adventures and meaningful connections.
                  </p>
                  <Button 
                    className="mt-6 hover-lift"
                    size="lg"
                  >
                    Start Your Journey
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: Globe,
                    title: "Discover New Places",
                    description: "Find trips to destinations you've always wanted to visit or discover new hidden gems suggested by locals."
                  },
                  {
                    icon: Users,
                    title: "Meet Like-minded Travelers",
                    description: "Connect with people who share your interests, travel style, and sense of adventure."
                  },
                  {
                    icon: Calendar,
                    title: "Flexible Travel Planning",
                    description: "Join existing trips or create your own. Travel when and how you want, with people you'll enjoy."
                  },
                  {
                    icon: Heart,
                    title: "Safe & Trusted Community",
                    description: "Our verification system and review process ensures a respectful, reliable travel community."
                  }
                ].map((feature, index) => (
                  <div 
                    key={index} 
                    className="glass-card p-6 rounded-xl animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="h-12 w-12 rounded-full bg-voyani-100 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-voyani-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        <section className="hero-gradient rounded-3xl mx-4 overflow-hidden">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl animate-fade-in">
                Ready to find your next travel companion?
              </h2>
              <p className="mt-4 text-lg text-gray-600 animate-fade-in animate-delay-100">
                Join Voyani today and start connecting with fellow adventurers from around the world.
              </p>
              <div className="mt-8 flex justify-center gap-4 animate-fade-in animate-delay-200">
                <Button size="lg" className="hover-lift">
                  Sign Up Now
                </Button>
                <Button variant="outline" size="lg" className="hover-lift">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
