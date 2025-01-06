import { Zap } from "lucide-react"
import { ToolsCarousel } from "@/components/home/ToolsCarousel"
import { ShortcutsSection } from "@/components/home/ShortcutsSection"

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section with Value Proposition */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FEF7CD] to-[#FFDEE2] text-gray-700 mb-6">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Votre assistant pédagogique IA</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            <span className="block text-gray-900">Gagnez du temps dans</span>
            <span className="bg-gradient-to-r from-coral-400 to-violet-500 bg-clip-text text-transparent">
              la préparation de vos cours
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Créez des contenus pédagogiques de qualité en quelques clics grâce à l'intelligence artificielle
          </p>
        </div>

        {/* Tools Carousel */}
        <ToolsCarousel />

        {/* Shortcuts Section */}
        <ShortcutsSection />
      </div>
    </div>
  )
}

export default Home