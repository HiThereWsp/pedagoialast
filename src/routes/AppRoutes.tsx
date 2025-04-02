
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { SubscriptionRoute } from './SubscriptionRoute';
import LandingPage from '@/pages/Landing';
import NotFound from '@/pages/NotFound';
import ConfirmEmail from '@/pages/ConfirmEmail';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import Bienvenue from '@/pages/Bienvenue';
import ToolsLayout from '@/components/layout/ToolsLayout';
import Guide from '@/pages/Guide';
import { BugReportButton } from '@/components/bug-report/BugReportButton';

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
const UserManagementPage = lazy(() => import('@/pages/UserManagement'));
const BrevoSyncPage = lazy(() => import('@/pages/admin/BrevoSyncPage'));
const AdminSubscriptionRepairPage = lazy(() => import('@/pages/AdminSubscriptionRepairPage'));
const AdminBugReportsPage = lazy(() => import('@/pages/AdminBugReportsPage')); // New import

// New payment pages
const PaymentSuccessPage = lazy(() => import('@/pages/PaymentSuccessPage'));
const PaymentFailurePage = lazy(() => import('@/pages/PaymentFailurePage'));

// Composant de chargement pour Suspense
const LoadingPage = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <LoadingIndicator />
      <p className="mt-4 text-gray-600">Chargement en cours...</p>
    </div>
  </div>
);

// Wrapper component to conditionally render BugReportButton
const AppContent = () => {
  const location = useLocation();
  const isBienvenuePage = location.pathname === '/bienvenue';
  
  return (
    <>
      <Routes>
        {/* Pages publiques */}
        <Route path="/" element={<Navigate to="/bienvenue" replace />} />
        <Route path="/bienvenue" element={<Bienvenue />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/pricing" element={<Pricing />} />
        {/* Route du guide rendue accessible */}
        <Route path="/guide" element={<Guide />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<ContactPage />} />
        
        {/* Redirection de /home vers /tableaudebord */}
        <Route path="/home" element={<Navigate to="/tableaudebord" replace />} />
        <Route path="/tableaudebord" element={
          <ProtectedRoute>
            <TableauDeBord />
          </ProtectedRoute>
        } />
        <Route path="/user-management" element={
          <ProtectedRoute>
            <UserManagementPage />
          </ProtectedRoute>
        } />
        
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
        <Route path="/suggestions" element={<ProtectedRoute><SuggestionsPage /></ProtectedRoute>} />
        <Route path="/marketing" element={<ProtectedRoute><MarketingPage /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/brevo-sync" element={<ProtectedRoute><BrevoSyncPage /></ProtectedRoute>} />
        <Route path="/admin/subscription-management" element={<ProtectedRoute><AdminSubscriptionRepairPage /></ProtectedRoute>} />
        <Route path="/admin/bug-reports" element={<ProtectedRoute><AdminBugReportsPage /></ProtectedRoute>} />
        
        {/* Routes de suivi des conversions */}
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment-failure" element={<PaymentFailurePage />} />
        
        {/* Routes de suivi des conversions */}
        <Route path="/subscription-success" element={<SubscriptionSuccessPage />} />
        <Route path="/subscription-failed" element={<SubscriptionFailedPage />} />
        <Route path="/checkout-canceled" element={<CheckoutCanceledPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Only show BugReportButton when not on Bienvenue page */}
      {!isBienvenuePage && <BugReportButton />}
    </>
  );
};

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <AppContent />
    </Suspense>
  );
}

export default AppRoutes;
