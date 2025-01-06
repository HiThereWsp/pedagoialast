export const WelcomeBanner = () => {
  return (
    <div className="mb-6 sm:mb-8 rounded-lg p-4 sm:p-6 bg-gradient-to-r from-[#FEF7CD]/20 to-[#FFDEE2]/20 backdrop-blur-sm border border-[#FEF7CD]/30 shadow-sm">
      <h2 className="mb-2 text-xl sm:text-2xl font-semibold text-gray-800">
        Bonjour, je suis Élia, votre assistante pédagogique IA
      </h2>
      <p className="text-sm sm:text-base text-gray-600">
        Je peux vous aider sur tous les aspects de votre métier. Posez simplement votre question !
      </p>
    </div>
  )
}