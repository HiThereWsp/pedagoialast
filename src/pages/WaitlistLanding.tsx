import { SEO } from "@/components/SEO"
import { Header } from "@/components/landing/Header"
import { HeroSection } from "@/components/landing/HeroSection"
import { MetricsSection } from "@/components/landing/MetricsSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { ChallengesSection } from "@/components/landing/ChallengesSection"

const WaitlistLanding = () => {
  return (
    <div className="min-h-screen">
      <SEO 
        title="PedagoIA - Rejoignez la liste d'attente" 
        description="Inscrivez-vous à la liste d'attente pour accéder à votre assistant pédagogique intelligent qui vous aide à adapter vos cours et gagner du temps."
      />
      <Header />
      <HeroSection />
      <ChallengesSection />
      <MetricsSection />
      <HowItWorksSection />
    </div>
  )
}

export default WaitlistLanding