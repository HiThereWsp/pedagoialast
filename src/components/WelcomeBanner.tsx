export const WelcomeBanner = () => {
  return (
    <div className="text-center max-w-3xl mx-auto px-4">
      <div className="flex items-center justify-center gap-2 mb-4">
        <img 
          src="/lovable-uploads/a514063e-400f-4c84-b2f2-78114e277365.png" 
          alt="PedagoIA Logo" 
          className="h-8"
        />
        <span className="text-xl font-medium">PedagoIA</span>
      </div>
      <p className="text-2xl font-medium text-gray-800">
        Bonjour,<br />
        Comment puis-je vous aider ?
      </p>
    </div>
  )
}