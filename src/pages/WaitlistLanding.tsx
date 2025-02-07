import { SEO } from "@/components/SEO"
import { Header } from "@/components/landing/Header"
import { HeroSection } from "@/components/landing/HeroSection"
import { MetricsSection } from "@/components/landing/MetricsSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { ChallengesSection } from "@/components/landing/ChallengesSection"
import Footer from "@/components/landing/Footer"

const WaitlistLanding = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="PedagoIA - Rejoignez la liste d'attente" 
        description="Inscrivez-vous à la liste d'attente pour accéder à votre assistant pédagogique intelligent qui vous aide à adapter vos cours et gagner du temps."
      />
      <Header />
      <main className="flex-grow px-4 md:px-6 lg:px-8">
        <HeroSection />
        <ChallengesSection />
        <MetricsSection />
        <HowItWorksSection />
      </main>
      <Footer />
    </div>
  )
}

export default WaitlistLanding