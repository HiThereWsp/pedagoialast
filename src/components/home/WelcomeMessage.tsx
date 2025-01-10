interface WelcomeMessageProps {
  firstName: string
}

export const WelcomeMessage = ({ firstName }: WelcomeMessageProps) => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
        Bonjour {firstName} 
        <span role="img" aria-label="wave">👋</span>
      </h1>
      <p className="text-xl text-gray-600">
        Sur quoi souhaitez-vous travailler aujourd'hui ?
      </p>
    </div>
  )
}