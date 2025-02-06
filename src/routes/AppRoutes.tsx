import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import Settings from '@/pages/Settings'
import { ProtectedRoute } from './ProtectedRoute'
import Login from '@/pages/Login'
import Landing from '@/pages/Landing'
import ExercisePage from '@/pages/ExercisePage'
import LessonPlanPage from '@/pages/LessonPlanPage'
import ImageGenerationPage from '@/pages/ImageGenerationPage'
import CorrespondencePage from '@/pages/CorrespondencePage'
import MetricsPage from '@/pages/MetricsPage'
import UTMLinksPage from '@/pages/UTMLinksPage'
import MarketingPage from '@/pages/MarketingPage'
import SuggestionsPage from '@/pages/SuggestionsPage'
import ContactPage from '@/pages/ContactPage'
import Privacy from '@/pages/Privacy'
import Terms from '@/pages/Terms'
import Legal from '@/pages/Legal'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import PricingPage from '@/pages/PricingPage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/exercise" element={<ExercisePage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/lesson-plan" element={<LessonPlanPage />} />
        <Route path="/image-generation" element={<ImageGenerationPage />} />
        <Route path="/correspondence" element={<CorrespondencePage />} />
        <Route path="/metrics" element={<MetricsPage />} />
        <Route path="/utm-links" element={<UTMLinksPage />} />
        <Route path="/marketing" element={<MarketingPage />} />
        <Route path="/suggestions" element={<SuggestionsPage />} />
      </Route>
      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
