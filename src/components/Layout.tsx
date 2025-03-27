
import React from 'react';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col bg-background dark-pattern">
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
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-24 h-1 mb-3 bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 rounded-full opacity-50"></div>
          <p>© {new Date().getFullYear()} Voyani India. All rights reserved.</p>
          <p className="mt-2 text-xs">Connecting Indian travelers, one journey at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
