
export const WelcomeBanner = () => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <img 
          src="/lovable-uploads/9e1b71c5-bc4b-405d-b81e-7c915027eff0.png" 
          alt="PedagoIA Logo" 
          className="h-10 sm:h-12"
        />
      </div>
      <p className="text-xl text-gray-800">
        Bonjour,<br />
        Comment puis-je vous aider ?
      </p>
    </div>
  )
}
