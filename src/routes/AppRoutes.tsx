import { Routes, Route, Navigate } from "react-router-dom"
import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import Index from "@/pages/Index"
import Login from "@/pages/Login"
import Settings from "@/pages/Settings"
import WaitlistLanding from "@/pages/WaitlistLanding"
import NotFound from "@/pages/NotFound"
import PricingPage from "@/pages/Pricing"
import { LessonPlanPage } from "@/pages/LessonPlanPage"
import { ExerciseGenerator } from "@/components/exercise/ExerciseGenerator"
import { ProtectedRoute } from "./ProtectedRoute"

export function AppRoutes() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<WaitlistLanding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/waitlist" element={<WaitlistLanding />} />
      <Route path="/pricing" element={<PricingPage />} />
      
      {/* Routes protégées */}
      <Route path="/chat" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <Index />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <Settings />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/creersequence" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <LessonPlanPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/exercices" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <ExerciseGenerator />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      {/* Route 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}