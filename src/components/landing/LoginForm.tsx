import { useState } from "react"
import { SignUpForm } from "./auth/SignUpForm"
import { SignInForm } from "./auth/SignInForm"
import {supabase} from "@/integrations/supabase/client.ts";
import {ThemeSupa} from "@supabase/auth-ui-shared";
import {Auth} from "@supabase/auth-ui-react";

export const LoginForm = () => {
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">
        {isSignUp ? "Inscription" : "Connexion"}
      </h2>
        <Auth
            supabaseClient={supabase}
            appearance={{
                theme: ThemeSupa,
            }}

            providers={["google"]}
            redirectTo="https://pedagoia.fr/login"
            onlyThirdPartyProviders={true}

        />
      {isSignUp ? (
          <SignUpForm onToggleMode={() => setIsSignUp(false)} />
      ) : (
          <SignInForm onToggleMode={() => setIsSignUp(true)} />
      )}
    </div>
  )
}