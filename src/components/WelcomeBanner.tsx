export const WelcomeBanner = () => {
  return (
    <div className="relative mb-8 rounded-2xl p-8 bg-gradient-headspace overflow-hidden">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
      <div className="relative z-10">
        <h2 className="mb-3 text-3xl font-semibold text-gray-800 animate-float">
          Bonjour, je suis Élia, votre assistante pédagogique IA
        </h2>
        <p className="text-lg text-gray-600">
          Je peux vous aider sur tous les aspects de votre métier. Posez simplement votre question !
        </p>
      </div>
      <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-headspace-orange/20 rounded-full blur-2xl" />
      <div className="absolute -left-4 -top-4 w-32 h-32 bg-headspace-purple/20 rounded-full blur-2xl" />
    </div>
  )
}