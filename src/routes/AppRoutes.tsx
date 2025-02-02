import { Routes, Route, Navigate } from "react-router-dom"
import { ProtectedRoute } from "./ProtectedRoute"
import { Suspense, lazy } from "react"
import { Loader2 } from "lucide-react"
import ForgotPassword from "@/pages/ForgotPassword.tsx"

// Lazy load components
const Index = lazy(() => import("@/pages/Index"))
const Home = lazy(() => import("@/pages/Home"))
const Login = lazy(() => import("@/pages/Login"))
const ResetPassword = lazy(() => import("@/pages/ResetPassword"))
const Settings = lazy(() => import("@/pages/Settings"))
const NotFound = lazy(() => import("@/pages/NotFound"))
const LessonPlanPage = lazy(() => import("@/pages/LessonPlanPage"))
const CorrespondencePage = lazy(() => import("@/pages/CorrespondencePage"))
const Landing = lazy(() => import("@/pages/Landing"))
const WaitlistLanding = lazy(() => import("@/pages/WaitlistLanding"))
const Pricing = lazy(() => import("@/pages/Pricing"))
const Privacy = lazy(() => import("@/pages/Privacy"))
const Legal = lazy(() => import("@/pages/Legal"))
const MetricsPage = lazy(() => import("@/pages/MetricsPage"))
const SuggestionsPage = lazy(() => import("@/pages/SuggestionsPage"))
const ExercisePage = lazy(() => import("@/pages/ExercisePage"))
const DiscoverPage = lazy(() => import("@/pages/DiscoverPage"))
const ContactPage = lazy(() => import("@/pages/ContactPage"))
const UTMLinksPage = lazy(() => import("@/pages/UTMLinksPage"))
const ImageGenerationPage = lazy(() => import("@/pages/ImageGenerationPage"))

// Loading component
const LoadingSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
)

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Route racine redirige vers /home ou /login selon l'authentification */}
        <Route path="/" element={<Landing />} />
        <Route path="/waitlist" element={<WaitlistLanding />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Routes protégées nécessitant une authentification */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/chat" element={<Index />} />
          <Route path="/lesson-plan" element={<LessonPlanPage />} />
          <Route path="/correspondence" element={<CorrespondencePage />} />
          <Route path="/exercises" element={<ExercisePage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/metrics" element={<MetricsPage />} />
          <Route path="/suggestions" element={<SuggestionsPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/myutmlinks" element={<UTMLinksPage />} />
          <Route path="/image-generation" element={<ImageGenerationPage />} />
        </Route>

        {/* Gestion des routes inconnues */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}