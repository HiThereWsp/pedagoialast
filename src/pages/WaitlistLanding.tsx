
import { SEO } from "@/components/SEO"
import { Header } from "@/components/landing/Header"
import { HeroSection } from "@/components/landing/HeroSection"
import { MetricsSection } from "@/components/landing/MetricsSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { ChallengesSection } from "@/components/landing/ChallengesSection"
import Footer from "@/components/landing/Footer"
import { Navigate } from "react-router-dom"

const WaitlistLanding = () => {
  // Redirect to Bienvenue page since this component is no longer used
  return <Navigate to="/bienvenue" replace />
}

export default WaitlistLanding
