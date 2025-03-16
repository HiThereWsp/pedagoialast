import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "./ProtectedRoute";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Pricing from "@/pages/Pricing";
import Home from "@/pages/Home";
import Tableaudebord from "@/pages/Tableaudebord";
import Contact from "@/pages/Contact";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Legal from "@/pages/Legal";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import ConfirmEmail from "@/pages/ConfirmEmail";

// Ajoutez l'import pour la page d'outils d'administration
import AdminTools from "@/pages/AdminTools";

function AppRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Track page view
    console.log("Page view:", location.pathname);
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/bienvenue" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Login />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/confirm-email" element={<ConfirmEmail />} />
      
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tableaudebord" 
        element={
          <ProtectedRoute>
            <Tableaudebord />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin-tools" 
        element={
          <ProtectedRoute>
            <AdminTools />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default AppRoutes;
