
import React from "react";
import { Route } from "react-router-dom";

// Public Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import ConfirmEmail from "@/pages/ConfirmEmail";
import Bienvenue from "@/pages/Bienvenue";
import Legal from "@/pages/Legal";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import PricingPage from "@/pages/PricingPage";
import Landing from "@/pages/Landing";
import ContactPage from "@/pages/ContactPage";
import DiscoverPage from "@/pages/DiscoverPage";
import BetaAccessPage from "@/pages/BetaAccessPage";
import NotFound from "@/pages/NotFound";

export const PublicRoutes = () => {
  return (
    <>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/confirm-email" element={<ConfirmEmail />} />
      <Route path="/bienvenue" element={<Bienvenue />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/discover" element={<DiscoverPage />} />
      <Route path="/beta-access" element={<BetaAccessPage />} />
      <Route path="*" element={<NotFound />} />
    </>
  );
};
