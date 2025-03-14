import type { FC } from "react"

interface WelcomeMessageProps {
  firstName: string
}

export const WelcomeMessage: FC<WelcomeMessageProps> = ({ firstName }) => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
        Bonjour {firstName} 
        <span role="img" aria-label="wave">👋</span>
      </h1>
      <p className="text-xl text-gray-600 flex items-center justify-center px-4 sm:px-0">
        Sur quoi souhaitez-vous travailler aujourd'hui ?
      </p>
    </div>
  )
}