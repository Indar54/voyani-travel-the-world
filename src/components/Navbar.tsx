
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Menu, X, User, Map, MapPin } from 'lucide-react';
import CommandSearch from './CommandSearch';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out
        ${isActive 
          ? 'text-white' 
          : 'text-foreground/80 hover:text-white'
        }`}
      >
        {children}
        {isActive && (
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <>
      <CommandSearch open={searchOpen} setOpen={setSearchOpen} />
      
      <header 
        className={`sticky top-0 z-40 w-full transition-all duration-200 
        ${scrolled ? 'neo-blur' : 'bg-transparent'}`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-600 flex items-center justify-center bg-black">
                  <img 
                    src="/lovable-uploads/26b716be-235d-43dd-833a-6bb8cfa8bb30.png" 
                    alt="Voyani" 
                    className="h-8 w-8 object-contain"
                    onError={(e) => {
                      // Fallback for image loading errors
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/32/111111/FFFFFF?text=V";
                    }}
                  />
                </div>
                <span className="ml-2 text-xl font-bold text-foreground text-gradient">Voyani</span>
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center space-x-1">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/browse">Explore</NavLink>
              <NavLink to="/create-group">Create Group</NavLink>
              <NavLink to="/local-travel">Destinations</NavLink>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden md:flex"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <Link to="/auth">
                <Button variant="outline" className="hidden md:flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>

              <Button 
                variant="default" 
                className="hidden md:flex items-center gap-2"
                onClick={() => setSearchOpen(true)}
              >
                <Map className="h-4 w-4" />
                Join a Trip
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden neo-blur animate-fade-in">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link 
                to="/" 
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/browse" 
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore
              </Link>
              <Link 
                to="/create-group" 
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create Group
              </Link>
              <Link 
                to="/local-travel" 
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Local Travel
              </Link>
              <div 
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/5 cursor-pointer"
                onClick={() => {
                  setSearchOpen(true);
                  setMobileMenuOpen(false);
                }}
              >
                <div className="flex items-center">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </div>
              </div>
              <Link 
                to="/auth" 
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
