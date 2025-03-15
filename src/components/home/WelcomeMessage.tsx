
import type { FC } from "react"
import { SparklesText } from "@/components/ui/sparkles-text"

interface WelcomeMessageProps {
  firstName: string
}

export const WelcomeMessage: FC<WelcomeMessageProps> = ({ firstName }) => {
  return (
    <div className="text-center mb-12 relative z-10">
      <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 tracking-tight text-balance mx-auto max-w-xl">
        <SparklesText 
          text={`Bonjour ${firstName}`}
          colors={{ first: "#9E7AFF", second: "#FE8BBB" }}
          className="leading-tight"
        />
      </h1>
      <p className="text-xl text-gray-600 font-medium px-4 sm:px-0">
        Sur quoi souhaitez-vous travailler aujourd'hui ?
      </p>
    </div>
  )
}
