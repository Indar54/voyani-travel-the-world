
import React from 'react';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          key={location.pathname}
          className="animate-fade-in"
        >
          {children}
        </div>
      </main>
      <footer className="py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Voyani. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
