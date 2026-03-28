import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocationProvider } from "@/contexts/LocationContext";
import { useScrollRestore } from "@/hooks/useScrollRestore";
import Feed from "./pages/Feed";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";

// Lazy-loaded routes
const Explore = lazy(() => import("./pages/Explore"));
const Coupons = lazy(() => import("./pages/Coupons"));
const Roteiros = lazy(() => import("./pages/Roteiros"));
const Establishment = lazy(() => import("./pages/Establishment"));
const Auth = lazy(() => import("./pages/Auth"));
const SavedPlaces = lazy(() => import("./pages/profile/SavedPlaces"));
const BadgesPage = lazy(() => import("./pages/profile/Badges"));
const RoutesPage = lazy(() => import("./pages/profile/Routes"));
const Settings = lazy(() => import("./pages/profile/Settings"));
const UserCoupons = lazy(() => import("./pages/profile/UserCoupons"));

const queryClient = new QueryClient();

function ScrollRestore() {
  useScrollRestore();
  return null;
}

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LocationProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollRestore />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Feed />} />
              <Route path="/map" element={<Explore />} />
              <Route path="/coupons" element={<Coupons />} />
              <Route path="/roteiros" element={<Roteiros />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/estabelecimento/:slug" element={<Establishment />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/perfil/lugares" element={<SavedPlaces />} />
              <Route path="/perfil/badges" element={<BadgesPage />} />
              <Route path="/perfil/roteiros" element={<RoutesPage />} />
              <Route path="/perfil/configuracoes" element={<Settings />} />
              <Route path="/perfil/cupons" element={<UserCoupons />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </LocationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
