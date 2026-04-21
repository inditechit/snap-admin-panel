import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Gallery from "./pages/Gallery";
import Blogs from "./pages/Blogs";
import Services from "./pages/Services";
import EventTypes from "./pages/EventTypes";
import Packages from "./pages/Packages";
import Careers from "./pages/Careers";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./lib/AuthContext";
import LoginPage from "./pages/LoginPage";
import { ProtectedRoute } from "./lib/ProtectedRoute";
import { useAuth } from "./lib/AuthContext";

const queryClient = new QueryClient();

// Helper Component to protect Admin-only routes
const AdminOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const isContentUser = user?.username?.toLowerCase() === "content";

  // If the user is "content", boot them to the blogs page
  if (isContentUser) {
    return <Navigate to="/blogs" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route element={<ProtectedRoute />}>
              
              {/* === Shared Routes (Content & Admin can access) === */}
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/blogs" element={<Blogs />} />

              {/* === Admin ONLY Routes === */}
              <Route path="/leads" element={<AdminOnlyRoute><Leads /></AdminOnlyRoute>} />
              <Route path="/services" element={<AdminOnlyRoute><Services /></AdminOnlyRoute>} />
              <Route path="/event-types" element={<AdminOnlyRoute><EventTypes /></AdminOnlyRoute>} />
              <Route path="/packages" element={<AdminOnlyRoute><Packages /></AdminOnlyRoute>} />
              <Route path="/careers" element={<AdminOnlyRoute><Careers /></AdminOnlyRoute>} />
              <Route path="/" element={<AdminOnlyRoute><Analytics /></AdminOnlyRoute>} />
              <Route path="/settings" element={<AdminOnlyRoute><Settings /></AdminOnlyRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Route>
            
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;