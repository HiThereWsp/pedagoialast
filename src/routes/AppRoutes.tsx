import { Routes, Route } from "react-router-dom"
import { ProtectedRoute } from "./ProtectedRoute"
import Index from "@/pages/Index"
import NewChat from "@/pages/NewChat"
import Login from "@/pages/Login"
import ForgotPassword from "@/pages/ForgotPassword"
import ResetPassword from "@/pages/ResetPassword"
import Settings from "@/pages/Settings"
import NotFound from "@/pages/NotFound"

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Index />} />
        <Route path="/new-chat" element={<NewChat />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
