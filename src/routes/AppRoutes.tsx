
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { SubscriptionRoute } from './SubscriptionRoute'
import ErrorBoundary from '@/components/ErrorBoundary'

// Import pages from the correct paths
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import SignupPage from '@/pages/SignupPage'
import PricingPage from '@/pages/PricingPage'
import ContactPage from '@/pages/ContactPage'
import Legal from '@/pages/Legal'
import Privacy from '@/pages/Privacy'
import Terms from '@/pages/Terms'
import TableauDeBord from '@/pages/TableauDeBord'
import Settings from '@/pages/Settings'
import CorrespondencePage from '@/pages/CorrespondencePage'
import LessonPlanPage from '@/pages/LessonPlanPage'
import ExercisePage from '@/pages/ExercisePage'
import SavedContentPage from '@/pages/SavedContentPage'
import ImageGenerationPage from '@/pages/ImageGenerationPage'
import Bienvenue from '@/pages/Bienvenue'

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Routes publiques - pas besoin de vérification d'abonnement */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/" element={<Landing />} />
        <Route path="/bienvenue" element={<Bienvenue />} />

        {/* Routes protégées - avec vérification d'abonnement */}
        {/* Adjust the Generator routes */}
        <Route path="/generateur-de-sequence" element={
          <SubscriptionRoute>
            <ErrorBoundary>
              <LessonPlanPage />
            </ErrorBoundary>
          </SubscriptionRoute>
        } />
        
        <Route path="/generateur-exercices" element={
          <SubscriptionRoute>
            <ErrorBoundary>
              <ExercisePage />
            </ErrorBoundary>
          </SubscriptionRoute>
        } />
        
        <Route path="/generateur-images" element={
          <SubscriptionRoute>
            <ErrorBoundary>
              <ImageGenerationPage />
            </ErrorBoundary>
          </SubscriptionRoute>
        } />
        
        <Route path="/generateur-correspondance" element={
          <SubscriptionRoute>
            <ErrorBoundary>
              <CorrespondencePage />
            </ErrorBoundary>
          </SubscriptionRoute>
        } />
        
        <Route path="/tableau-de-bord" element={
          <ErrorBoundary>
            <TableauDeBord />
          </ErrorBoundary>
        } />
        
        <Route path="/settings/*" element={
          <ErrorBoundary>
            <Settings />
          </ErrorBoundary>
        } />
        
        <Route path="/contenu-sauvegarde" element={
          <ErrorBoundary>
            <SavedContentPage />
          </ErrorBoundary>
        } />

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default AppRoutes
