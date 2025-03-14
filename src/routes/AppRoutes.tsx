

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { SubscriptionRoute } from './SubscriptionRoute';
import LandingPage from '@/pages/Landing';
import NotFound from '@/pages/NotFound';
import ConfirmEmail from '@/pages/ConfirmEmail';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import Bienvenue from '@/pages/Bienvenue';
import ToolsLayout from '@/components/layout/ToolsLayout';

// Chargement paresseux des pages
const LoginPage = lazy(() => import('@/pages/Login'));
const TableauDeBord = lazy(() => import('@/pages/TableauDeBord'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const ExercisePage = lazy(() => import('@/pages/ExercisePage'));
const SavedContentPage = lazy(() => import('@/pages/SavedContentPage'));
const LessonPlanPage = lazy(() => import('@/pages/LessonPlanPage'));
const ImageGenerationPage = lazy(() => import('@/pages/ImageGenerationPage'));
const CorrespondencePage = lazy(() => import('@/pages/CorrespondencePage'));
const DiscoverPage = lazy(() => import('@/pages/DiscoverPage'));
const MetricsPage = lazy(() => import('@/pages/MetricsPage'));
const Settings = lazy(() => import('@/pages/Settings'));
const DeleteAccount = lazy(() => import('@/pages/DeleteAccount'));
const UTMLinksPage = lazy(() => import('@/pages/UTMLinksPage'));
const RedirectsPage = lazy(() => import('@/pages/RedirectsPage'));
const Legal = lazy(() => import('@/pages/Legal'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const SuggestionsPage = lazy(() => import('@/pages/SuggestionsPage'));
const MarketingPage = lazy(() => import('@/pages/MarketingPage'));
const OfflineChatPage = lazy(() => import('@/pages/OfflineChatPage'));
const SubscriptionSuccessPage = lazy(() => import('@/pages/SubscriptionSuccessPage'));
const SubscriptionFailedPage = lazy(() => import('@/pages/SubscriptionFailedPage'));
const CheckoutCanceledPage = lazy(() => import('@/pages/CheckoutCanceledPage'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));

// Composant de chargement pour Suspense
const LoadingPage = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <LoadingIndicator />
      <p className="mt-4 text-gray-600">Chargement en cours...</p>
    </div>
  </div>
);

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        <Route path="/" element={<Navigate to="/bienvenue" replace />} />
        <Route path="/bienvenue" element={<Bienvenue />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/pricing" element={<Pricing />} />
        
        {/* Redirection de /home vers /tableaudebord */}
        <Route path="/home" element={<Navigate to="/tableaudebord" replace />} />
        <Route path="/tableaudebord" element={<ProtectedRoute><TableauDeBord /></ProtectedRoute>} />
        
        {/* Routes des outils pédagogiques utilisant le layout partagé */}
        <Route element={<ProtectedRoute><SubscriptionRoute><ToolsLayout /></SubscriptionRoute></ProtectedRoute>}>
          <Route path="/exercise" element={<ExercisePage />} />
          <Route path="/lesson-plan" element={<LessonPlanPage />} />
          <Route path="/image-generation" element={<ImageGenerationPage />} />
          <Route path="/correspondence" element={<CorrespondencePage />} />
          <Route path="/offline-chat" element={<OfflineChatPage />} />
          <Route path="/saved-content" element={<SavedContentPage />} />
        </Route>
        
        {/* Routes accessibles sans abonnement */}
        <Route path="/discover" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
        <Route path="/metrics" element={<ProtectedRoute><MetricsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/delete-account" element={<ProtectedRoute><DeleteAccount /></ProtectedRoute>} />
        <Route path="/utm-links" element={<ProtectedRoute><UTMLinksPage /></ProtectedRoute>} />
        <Route path="/redirects" element={<ProtectedRoute><RedirectsPage /></ProtectedRoute>} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/suggestions" element={<ProtectedRoute><SuggestionsPage /></ProtectedRoute>} />
        <Route path="/marketing" element={<ProtectedRoute><MarketingPage /></ProtectedRoute>} />
        <Route path="/contact" element={<ContactPage />} />
        
        {/* Routes de suivi des conversions */}
        <Route path="/subscription-success" element={<SubscriptionSuccessPage />} />
        <Route path="/subscription-failed" element={<SubscriptionFailedPage />} />
        <Route path="/checkout-canceled" element={<CheckoutCanceledPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
