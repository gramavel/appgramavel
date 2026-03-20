import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocationProvider } from "@/contexts/LocationContext";
import { useScrollRestore } from "@/hooks/useScrollRestore";
import Feed from "./pages/Feed";
import Explore from "./pages/Explore";
import Coupons from "./pages/Coupons";
import Profile from "./pages/Profile";
import Roteiros from "./pages/Roteiros";
import Establishment from "./pages/Establishment";
import Auth from "./pages/Auth";
import SavedPlaces from "./pages/profile/SavedPlaces";
import BadgesPage from "./pages/profile/Badges";
import RoutesPage from "./pages/profile/Routes";
import Settings from "./pages/profile/Settings";
import UserCoupons from "./pages/profile/UserCoupons";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ScrollRestore() {
  useScrollRestore();
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LocationProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollRestore />
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
        </BrowserRouter>
      </LocationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
