
import type { FC } from "react"

interface WelcomeMessageProps {
  firstName: string
}

export const WelcomeMessage: FC<WelcomeMessageProps> = ({ firstName }) => {
  return (
    <div className="text-center mb-10">
      <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-balance">
        Bonjour {firstName} 
        <span role="img" aria-label="wave" className="ml-2">👋</span>
      </h1>
      <p className="text-xl text-gray-600 mt-4 max-w-md mx-auto">
        Sur quoi souhaitez-vous travailler aujourd'hui ?
      </p>
    </div>
  )
}
