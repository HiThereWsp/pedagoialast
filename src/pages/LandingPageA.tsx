
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
        title="PedagoIA - Assistant pédagogique intelligent pour les enseignants" 
        description="Gagnez du temps dans la préparation de vos cours avec PedagoIA, votre assistant pédagogique intelligent qui adapte vos contenus en quelques clics."
      />
      <Header />
      <main className="flex-grow px-4 md:px-6 lg:px-8">
        <HeroSection />
        <ChallengesSection />
        <MetricsSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPageA
