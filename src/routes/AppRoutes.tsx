
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LandingPage from '@/pages/Landing';
import NotFound from '@/pages/NotFound';
import ConfirmEmail from '@/pages/ConfirmEmail';
import { LoadingIndicator } from '@/components/ui/loading-indicator';

// Chargement paresseux des pages
const LoginPage = lazy(() => import('@/pages/Login'));
const Home = lazy(() => import('@/pages/Home'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const ExercisePage = lazy(() => import('@/pages/ExercisePage'));
const SavedContentPage = lazy(() => import('@/pages/SavedContentPage'));
const LessonPlanPage = lazy(() => import('@/pages/LessonPlanPage'));
const ImageGenerationPage = lazy(() => import('@/pages/ImageGenerationPage'));
const DiscoverPage = lazy(() => import('@/pages/DiscoverPage'));
const MetricsPage = lazy(() => import('@/pages/MetricsPage'));
const Settings = lazy(() => import('@/pages/Settings'));
const DeleteAccount = lazy(() => import('@/pages/DeleteAccount'));
const UTMLinksPage = lazy(() => import('@/pages/UTMLinksPage'));
const Legal = lazy(() => import('@/pages/Legal'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const SuggestionsPage = lazy(() => import('@/pages/SuggestionsPage'));
const MarketingPage = lazy(() => import('@/pages/MarketingPage'));
const CorrespondencePage = lazy(() => import('@/pages/CorrespondencePage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const OfflineChatPage = lazy(() => import('@/pages/OfflineChatPage'));
const PricingPage = lazy(() => import('@/pages/PricingPage'));
const WaitlistLanding = lazy(() => import('@/pages/WaitlistLanding'));

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
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/waiting-list" element={<WaitlistLanding />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/exercise" element={<ProtectedRoute><ExercisePage /></ProtectedRoute>} />
        <Route path="/saved-content" element={<ProtectedRoute><SavedContentPage /></ProtectedRoute>} />
        <Route path="/lesson-plan" element={<ProtectedRoute><LessonPlanPage /></ProtectedRoute>} />
        <Route path="/image-generation" element={<ProtectedRoute><ImageGenerationPage /></ProtectedRoute>} />
        <Route path="/discover" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
        <Route path="/metrics" element={<ProtectedRoute><MetricsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/delete-account" element={<ProtectedRoute><DeleteAccount /></ProtectedRoute>} />
        <Route path="/utm-links" element={<ProtectedRoute><UTMLinksPage /></ProtectedRoute>} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/suggestions" element={<ProtectedRoute><SuggestionsPage /></ProtectedRoute>} />
        <Route path="/marketing" element={<ProtectedRoute><MarketingPage /></ProtectedRoute>} />
        <Route path="/correspondence" element={<ProtectedRoute><CorrespondencePage /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
        <Route path="/offline-chat" element={<ProtectedRoute><OfflineChatPage /></ProtectedRoute>} />
        <Route path="/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
