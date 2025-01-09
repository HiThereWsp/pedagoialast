export const WelcomeBanner = () => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <img 
          src="/lovable-uploads/a514063e-400f-4c84-b2f2-78114e277365.png" 
          alt="PedagoIA Logo" 
          className="h-8"
        />
      </div>
      <p className="text-xl text-gray-800">
        Bonjour,<br />
        Comment puis-je vous aider ?
      </p>
    </div>
  )
}