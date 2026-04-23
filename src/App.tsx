import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CommerceProvider } from "@/contexts/CommerceContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Payments from "./pages/Payments";
import Profile from "./pages/Profile";
import AdminPayments from "./pages/AdminPayments";
import AdminNews from "./pages/AdminNews";
import AdminTickets from "./pages/AdminTickets";
import ResetPassword from "./pages/ResetPassword";
import { Sales, Cards, Socks, Proxy, Tools } from "./pages/Sections";
import MyOrders from "./pages/MyOrders";
import Tickets from "./pages/Tickets";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner theme="dark" position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <CommerceProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
              <Route path="/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
              <Route path="/socks" element={<ProtectedRoute><Socks /></ProtectedRoute>} />
              <Route path="/proxy" element={<ProtectedRoute><Proxy /></ProtectedRoute>} />
              <Route path="/tools" element={<ProtectedRoute><Tools /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
              <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="/admin/news" element={<ProtectedRoute><AdminNews /></ProtectedRoute>} />
              <Route path="/admin/tickets" element={<ProtectedRoute><AdminTickets /></ProtectedRoute>} />
              <Route path="/admin/payments" element={<ProtectedRoute><AdminPayments /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CommerceProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
