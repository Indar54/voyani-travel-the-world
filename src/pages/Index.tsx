import React, { useEffect, Suspense, lazy } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Globe, Users, Calendar, ArrowRight, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Lazy load components that might be causing issues
const Hero = lazy(() => import('@/components/Hero'));
const FeaturedGroups = lazy(() => import('@/components/FeaturedGroups'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="container mx-auto px-4 py-12 text-center">
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/4 mb-8"></div>
      <div className="h-64 bg-gray-300 rounded w-full max-w-2xl mb-6"></div>
    </div>
  </div>
);

const Index = () => {
  const { isLoading: authLoading } = useAuth();

  useEffect(() => {
    console.log('Index page mounted');
    console.log('Auth loading state:', authLoading);
  }, [authLoading]);

  if (authLoading) {
    return (
      <Layout>
        <LoadingFallback />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-20">
        <Suspense fallback={<LoadingFallback />}>
          <Hero />
        </Suspense>
        
        <Suspense fallback={<LoadingFallback />}>
          <FeaturedGroups />
        </Suspense>
        
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-1 flex flex-col justify-center">
                <div className="animate-fade-in">
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    A Social Network for Real-World Connections
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                    In today's digitally isolated world, Voyani helps you break free from endless scrolling 
                    and rediscover the joy of authentic human connections through shared travel experiences.
                  </p>
                  <Button 
                    className="mt-6 hover-lift"
                    size="lg"
                  >
                    Join Our Community
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: Globe,
                    title: "Personalized Recommendations",
                    description: "Our intelligent matching system connects you with trips and travelers that match your interests and travel style."
                  },
                  {
                    icon: Users,
                    title: "Meaningful Social Connections",
                    description: "Form genuine friendships with people who share your passion for exploration and authentic experiences."
                  },
                  {
                    icon: MessageCircle,
                    title: "Community Support",
                    description: "Exchange travel tips, cultural insights, and personal experiences with a supportive community of fellow travelers."
                  },
                  {
                    icon: Heart,
                    title: "Mental Wellbeing",
                    description: "Combat social isolation through real-world connections that improve mental health and overall life satisfaction."
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
                Rediscover human connection in a digital age
              </h2>
              <p className="mt-4 text-lg text-gray-600 animate-fade-in animate-delay-100">
                In an era of increasing social isolation, Voyani helps you build meaningful relationships through 
                shared travel experiences. Join our community and make connections that matter.
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
