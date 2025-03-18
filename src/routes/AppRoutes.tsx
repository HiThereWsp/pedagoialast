import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { SubscriptionRoute } from './SubscriptionRoute'
import ErrorBoundary from '@/components/ErrorBoundary'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import PricingPage from '@/pages/PricingPage'
import ContactPage from '@/pages/ContactPage'
import LegalPage from '@/pages/LegalPage'
import PrivacyPage from '@/pages/PrivacyPage'
import TermsPage from '@/pages/TermsPage'
import DashboardPage from '@/pages/Home'
import SettingsLayout from '@/components/layout/SettingsLayout'
import AccountLayout from '@/components/layout/AccountLayout'
import GeneratorLayout from '@/components/layout/GeneratorLayout'

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Routes publiques - pas besoin de vérification d'abonnement */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/" element={<LandingPage />} />

        {/* Routes protégées - avec vérification d'abonnement */}
        <Route path="/generateur-*" element={
          <SubscriptionRoute>
            <ErrorBoundary>
              <GeneratorLayout />
            </ErrorBoundary>
          </SubscriptionRoute>
        } />
        
        <Route path="/tableau-de-bord" element={
          <ErrorBoundary>
            <DashboardPage />
          </ErrorBoundary>
        } />
        
        <Route path="/settings/*" element={
          <ErrorBoundary>
            <SettingsLayout />
          </ErrorBoundary>
        } />
        
        <Route path="/account/*" element={
          <ErrorBoundary>
            <AccountLayout />
          </ErrorBoundary>
        } />

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default AppRoutes
