import { Routes, Route } from "react-router-dom"
import { ProtectedRoute } from "./ProtectedRoute"
import Index from "@/pages/Index"
import Home from "@/pages/Home"
import Login from "@/pages/Login"
import Settings from "@/pages/Settings"
import NotFound from "@/pages/NotFound"
import LessonPlanPage from "@/pages/LessonPlanPage"
import CorrespondencePage from "@/pages/CorrespondencePage"
import Landing from "@/pages/Landing"
import WaitlistLanding from "@/pages/WaitlistLanding"
import Pricing from "@/pages/Pricing"
import MetricsPage from "@/pages/MetricsPage"
import SuggestionsPage from "@/pages/SuggestionsPage"

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/waitlist" element={<WaitlistLanding />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/login" element={<Login />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<Index />} />
        <Route path="/lesson-plan" element={<LessonPlanPage />} />
        <Route path="/correspondence" element={<CorrespondencePage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/metrics" element={<MetricsPage />} />
        <Route path="/suggestions" element={<SuggestionsPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}