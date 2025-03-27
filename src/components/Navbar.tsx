
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Menu, X, User, Globe, Map } from 'lucide-react';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
          ? 'text-voyani-600' 
          : 'text-foreground/80 hover:text-voyani-600'
        }`}
      >
        {children}
        {isActive && (
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-voyani-500 rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <header 
      className={`sticky top-0 z-40 w-full transition-all duration-200 
      ${scrolled ? 'glass-navbar' : 'bg-transparent'}`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Globe className="h-8 w-8 text-voyani-500" />
              <span className="ml-2 text-xl font-bold text-foreground">Voyani</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/browse">Explore</NavLink>
            <NavLink to="/create-group">Create Group</NavLink>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>
            
            <Link to="/auth">
              <Button variant="outline" className="hidden md:flex items-center gap-2">
                <User className="h-4 w-4" />
                Sign In
              </Button>
            </Link>

            <Button variant="default" className="hidden md:flex items-center gap-2">
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
        <div className="md:hidden glass-card animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-voyani-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/browse" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-voyani-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Explore
            </Link>
            <Link 
              to="/create-group" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-voyani-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Create Group
            </Link>
            <Link 
              to="/auth" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-voyani-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
