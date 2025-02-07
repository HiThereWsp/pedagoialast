
export const WelcomeBanner = () => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <img 
          src="/lovable-uploads/e646be0d-3564-4f7d-bcc8-bff1b74dc554.png" 
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
