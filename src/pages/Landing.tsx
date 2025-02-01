import { HeroSection } from "@/components/landing/HeroSection"
import { Header } from "@/components/landing/Header"
import { Footer } from "@/components/landing/Footer"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { TestimonialsSection } from "@/components/landing/TestimonialsSection"
import { FAQSection } from "@/components/landing/FAQSection"
import { SEO } from "@/components/SEO"

export default function Landing() {
  return (
    <>
      <SEO 
        title="PedagoIA - L'assistant qui révolutionne la préparation des cours"
        description="Créez des contenus pédagogiques personnalisés et innovants en quelques clics grâce à l'intelligence artificielle."
      />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <HeroSection />
          <HowItWorksSection />
          <TestimonialsSection />
          <FAQSection />
        </main>
        <Footer />
      </div>
    </>
  )
}