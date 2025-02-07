
import { HeroSection } from "@/components/landing/HeroSection"
import { ChallengesSection } from "@/components/landing/ChallengesSection"
import { MetricsSection } from "@/components/landing/MetricsSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { TestimonialsSection } from "@/components/landing/TestimonialsSection"
import { FAQSection } from "@/components/landing/FAQSection"
import { Header } from "@/components/landing/Header"
import { SEO } from "@/components/SEO"
import Footer from "@/components/landing/Footer"

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="PedagoIA - Assistant pédagogique intelligent" 
        description="Votre assistant pédagogique qui vous aide à adapter vos cours, effectuer vos tâches administratives et préparer vos cours plus efficacement."
      />
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <ChallengesSection />
        <MetricsSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}

export default Landing
