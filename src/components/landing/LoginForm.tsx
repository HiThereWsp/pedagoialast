import { useState } from "react"
import { SignUpForm } from "./auth/SignUpForm"
import { SignInForm } from "./auth/SignInForm"

export const LoginForm = () => {
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">
        {isSignUp ? "Inscription" : "Connexion"}
      </h2>
      
      {isSignUp ? (
        <SignUpForm onToggleMode={() => setIsSignUp(false)} />
      ) : (
        <SignInForm onToggleMode={() => setIsSignUp(true)} />
      )}
    </div>
  )
}