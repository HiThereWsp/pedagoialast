
export const WelcomeBanner = () => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <img 
          src="/lovable-uploads/efb9f5d8-aaf9-42ea-853a-4ca24bf0469d.png" 
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
