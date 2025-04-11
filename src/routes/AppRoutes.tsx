import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { SubscriptionRoute } from './SubscriptionRoute';
// ... autres imports ...
import { useAnalytics } from '@/hooks';

// Chargement paresseux des pages
// ... lazy imports restent identiques ...

const AppContent = () => {
  const location = useLocation();
  const isBienvenuePage = location.pathname === '/bienvenue';
  const { logEvent } = useAnalytics();
  
  return (
    <>
      <Routes>
        {/* Pages publiques */}
        <Route path="/" element={<Navigate to="/bienvenue" replace />} />
        <Route path="/bienvenue" element={<Bienvenue />} />
        <Route path="/landing" element={<LandingPage />} />
        {/* ... autres routes publiques ... */}
        
        {/* Routes des outils pédagogiques utilisant le layout partagé */}
        <Route element={<ProtectedRoute><SubscriptionRoute><ToolsLayout /></SubscriptionRoute></ProtectedRoute>}>
          <Route path="/exercise" element={<ExercisePage />} />
          <Route path="/lesson-plan" element={<LessonPlanPage />} />
          {/* ... autres routes d'outils ... */}
        </Route>
        
        {/* Routes accessibles sans abonnement */}
        <Route path="/discover" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
        {/* ... autres routes sans abonnement ... */}

        {/* Admin routes */}
        <Route path="/admin/brevo-sync" element={<ProtectedRoute><BrevoSyncPage /></ProtectedRoute>} />
        <Route path="/admin/subscription-management" element={<ProtectedRoute><AdminSubscriptionRepairPage /></ProtectedRoute>} />
        <Route path="/admin/bug-reports" element={<ProtectedRoute><AdminBugReportsPage /></ProtectedRoute>} />
        <Route path="/admin/suggestions" element={<ProtectedRoute><SuggestionsManagementPage /></ProtectedRoute>} />
        
        {/* Routes de suivi des conversions */}
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment-failure" element={<PaymentFailurePage />} />
        <Route path="/subscription-success" element={<SubscriptionSuccessPage />} />
        <Route path="/subscription-failed" element={<SubscriptionFailedPage />} />
        <Route path="/checkout-canceled" element={<CheckoutCanceledPage />} />

        {/* Redirections et routes spéciales */}
        <Route path="/generateur-exercices" element={<Navigate to="/exercise" replace />} />
        <Route path="/suggestion/:id" element={<ProtectedRoute><SuggestionDetailPage /></ProtectedRoute>} />
        
        {/* Route 404 */}
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