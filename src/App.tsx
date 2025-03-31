import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Suspense, lazy } from "react";

// Lazy load components
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const BrowseGroups = lazy(() => import("./pages/BrowseGroups"));
const CreateGroup = lazy(() => import("./pages/CreateGroup"));
const GroupDetails = lazy(() => import("./pages/GroupDetails"));
const Profile = lazy(() => import("./pages/Profile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Messages = lazy(() => import("./pages/Messages"));
const UserSearch = lazy(() => import("./pages/UserSearch"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LocalTravel = lazy(() => import("./pages/LocalTravel"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-8 bg-gray-300 rounded w-32 mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-24"></div>
    </div>
  </div>
);

// Force dark mode
if (typeof window !== 'undefined') {
  document.documentElement.classList.add('dark');
}

// Create a client with production-ready settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" closeButton />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/browse" element={<BrowseGroups />} />
              <Route path="/create-group" element={<CreateGroup />} />
              <Route path="/group/:id" element={<GroupDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/users" element={<UserSearch />} />
              <Route path="/local-travel" element={<LocalTravel />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
