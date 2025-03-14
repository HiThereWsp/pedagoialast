
import type { FC } from "react"

interface WelcomeMessageProps {
  firstName: string
}

export const WelcomeMessage: FC<WelcomeMessageProps> = ({ firstName }) => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight tracking-tight text-balance flex flex-col sm:flex-row items-center justify-center gap-2">
        Bonjour <span className="rotate-1 inline-block">{firstName}</span> 
        <span role="img" aria-label="wave" className="-rotate-1 inline-block">👋</span>
      </h1>
      <p className="text-xl text-gray-600 flex items-center justify-center px-4 sm:px-0">
        Sur quoi souhaitez-vous travailler aujourd'hui ?
      </p>
    </div>
  )
}
