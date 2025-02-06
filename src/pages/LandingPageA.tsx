
import { SEO } from "@/components/SEO"
import { Header } from "@/components/landing/Header"
import { HeroSection } from "@/components/landing/HeroSection"
import { MetricsSection } from "@/components/landing/MetricsSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { ChallengesSection } from "@/components/landing/ChallengesSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { FAQSection } from "@/components/landing/FAQSection"
import { TestimonialsSection } from "@/components/landing/TestimonialsSection"
import Footer from "@/components/landing/Footer"

const LandingPageA = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="PedagoIA - Créez vos cours 10x plus vite avec l'IA" 
        description="Gagnez du temps dans la préparation de vos cours avec PedagoIA, votre assistant pédagogique intelligent qui crée vos contenus pédagogiques en quelques clics."
      />
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <MetricsSection />
        <ChallengesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPageA
